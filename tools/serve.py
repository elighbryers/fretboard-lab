# Local dev server: like `python3 -m http.server`, but tells the browser not to
# keep copies (Cache-Control: no-store), so edits always show up and a file that
# was mid-save or mid-sync is never kept. Usage: python3 tools/serve.py [port]
import http.server, os, sys

class NoStore(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
print(f'Serving Fretboard Lab on http://localhost:{port} (and your Wi-Fi address) with no caching')
http.server.ThreadingHTTPServer(('0.0.0.0', port), NoStore).serve_forever()
