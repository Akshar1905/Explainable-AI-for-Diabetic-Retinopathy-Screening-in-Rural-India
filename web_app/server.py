#!/usr/bin/env python3
"""
Lightweight Web Server for Explainable AI DR Screening (XAI-DR)
"""
import http.server
import socketserver
import os
import sys
import webbrowser

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def log_message(self, format, *args):
        # Clean logging
        sys.stderr.write(f"[RetinaX Server] {args[0]} {args[1]}\n")

def find_available_port(start_port):
    import socket
    port = start_port
    while port < start_port + 100:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            if s.connect_ex(('localhost', port)) != 0:
                return port
            port += 1
    return start_port

def main():
    port = find_available_port(PORT)
    url = f"http://localhost:{port}/index.html"
    print("=" * 70)
    print(" Explainable AI for Diabetic Retinopathy Screening (XAI-DR)")
    print(f" Web Application Server running at: {url}")
    print("=" * 70)
    
    # Open browser automatically
    try:
        webbrowser.open(url)
    except Exception:
        pass

    with socketserver.TCPServer(("", port), Handler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server.")

if __name__ == "__main__":
    main()
