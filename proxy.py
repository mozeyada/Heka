import socket
import select
import sys
import threading

def handle_client(client_socket, target_host, target_port):
    try:
        remote_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        remote_socket.connect((target_host, target_port))
        
        while True:
            rlist, _, xlist = select.select([client_socket, remote_socket], [], [client_socket, remote_socket])
            if xlist: break
            for sock in rlist:
                if sock is client_socket:
                    data = client_socket.recv(4096)
                    if not data: return
                    remote_socket.sendall(data)
                elif sock is remote_socket:
                    data = remote_socket.recv(4096)
                    if not data: return
                    client_socket.sendall(data)
    except Exception as e:
        print(f"Error: {e}")
    finally:
        client_socket.close()
        try: remote_socket.close()
        except: pass

def start_proxy(local_port, target_host, target_port):
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.bind(('127.0.0.1', local_port))
    server.listen(5)
    print(f"Proxy listening on 127.0.0.1:{local_port} -> {target_host}:{target_port}")
    
    while True:
        client_socket, addr = server.accept()
        proxy_thread = threading.Thread(target=handle_client, args=(client_socket, target_host, target_port))
        proxy_thread.daemon = True
        proxy_thread.start()

with open("/etc/resolv.conf", "r") as f:
    for line in f:
        if line.startswith("nameserver"):
            target_host = line.split()[1]
            start_proxy(3845, target_host, 3845)
            sys.exit(0)
