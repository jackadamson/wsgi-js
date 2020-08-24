from flask import Flask
import os
app = Flask(__name__)


@app.route('/')
def hello_world():
    env = "\n".join(f"{k}={v}" for k, v in os.environ.items())
    return 'Hello, World!\nMy Friend!' + env, 200, {"Content-Type": "text/plain"}
