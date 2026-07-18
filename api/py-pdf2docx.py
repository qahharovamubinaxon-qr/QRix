# Built-in PDF -> DOCX engine (pdf2docx) — the unlimited final fallback of
# the /api/pdf-to-word provider chain. Runs as a Vercel Python function next
# to the Next.js app; no external hosting, no cold-start sleep.
#
# Protected with the CRON_SECRET the project already has: the Node chain
# sends it as x-qrix-key so strangers can't burn CPU on the open URL.
# If CRON_SECRET is unset (local dev), the check is skipped.

import os
import tempfile
from http.server import BaseHTTPRequestHandler

MAX_BYTES = 25 * 1024 * 1024
DOCX_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(b'{"engine":"pdf2docx","ok":true}')

    def do_POST(self):
        secret = os.environ.get("CRON_SECRET", "")
        if secret and self.headers.get("x-qrix-key", "") != secret:
            self.send_response(401)
            self.end_headers()
            return

        try:
            length = int(self.headers.get("content-length", "0"))
        except ValueError:
            length = 0
        if length < 5 or length > MAX_BYTES:
            self.send_response(400)
            self.end_headers()
            return

        data = self.rfile.read(length)
        if not data.startswith(b"%PDF"):
            self.send_response(400)
            self.end_headers()
            return

        pdf_path = docx_path = ""
        try:
            from pdf2docx import Converter

            with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as f:
                f.write(data)
                pdf_path = f.name
            docx_path = pdf_path[:-4] + ".docx"

            cv = Converter(pdf_path)
            cv.convert(docx_path)
            cv.close()

            with open(docx_path, "rb") as f:
                out = f.read()
            if len(out) < 1000:
                raise RuntimeError("empty result")

            self.send_response(200)
            self.send_header("Content-Type", DOCX_MIME)
            self.send_header("Content-Length", str(len(out)))
            self.end_headers()
            self.wfile.write(out)
        except Exception as e:  # noqa: BLE001 — report, never crash the lambda
            self.send_response(500)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(('{"error":"%s"}' % str(e)[:200].replace('"', "'")).encode())
        finally:
            for p in (pdf_path, docx_path):
                if p and os.path.exists(p):
                    try:
                        os.unlink(p)
                    except OSError:
                        pass
