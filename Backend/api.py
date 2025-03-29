from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import platform
import re
import subprocess
import shutil
from datetime import datetime
from typing import Optional


class CommandRequest(BaseModel):
    command: str

class CommandResponse(BaseModel):
    response: str
    success: bool = True
    error: Optional[str] = None
    pwd: str

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Adjust based on your frontend origin
    allow_methods=["*"],
    allow_headers=["*"],
)

class CommandHandler:
    def __init__(self):
        self.current_directory = os.getcwd()  # Start in the current working directory
        self.commands = {
            'help': self.help_command,
            'ls': self.list_directory,
            'mkdir': self.make_directory,
            'rm': self.remove_item,
            'mv': self.move_item,
            'cp': self.copy_item,
            'cat': self.read_file,
            'echo': self.echo_command,
            'touch': self.touch_file,
            'clear': self.clear_command,
            'head': self.head_file,
            'tail': self.tail_file,
            'wc': self.word_count,
            'less': self.less_file,
            'open': self.open_file,
            'find': self.find_file,
            'grep': self.grep_file,
            'ip': self.get_ip_address,
            'ping': self.ping_command,
            'traceroute': self.traceroute_command,
            'netstat': self.netstat_command,
            'nslookup': self.nslookup_command,
            'top': self.tasklist_command,
            'ps': self.tasklist_command,
            'kill': self.kill_process,
            'date': self.get_date,
            'cd': self.change_directory,
            'pwd': self.print_working_directory,
            'df': self.disk_usage,
            'du': self.disk_usage_directory,
        }
    
    def print_working_directory(self, args):
        return f"Current Directory: {self.current_directory}"

    def disk_usage(self, args):
        try:
            command = "df -h" if platform.system() != "Windows" else "wmic logicaldisk get size,freespace,caption"
            result = subprocess.run(command, shell=True, capture_output=True, text=True)
            return result.stdout
        except Exception as e:
            return f"Error getting disk usage: {e}"

    def disk_usage_directory(self, args):
        directory = args[0] if args else "."
        try:
            command = ["du", "-sh", directory] if platform.system() != "Windows" else None
            if command:
                result = subprocess.run(command, capture_output=True, text=True)
                return result.stdout.strip()
            return f"Error: 'du' is not available on Windows."
        except Exception as e:
            return f"Error getting directory size: {e}"

        
    def change_directory(self, args):
        if not args:
            return f"Current Directory: {self.current_directory}"
        try:
            new_dir = os.path.abspath(os.path.join(self.current_directory, args[0]))
            if os.path.isdir(new_dir):
                self.current_directory = new_dir
                return f"Changed directory to {self.current_directory}"
            return f"Error: '{new_dir}' is not a valid directory."
        except Exception as e:
            return f"Error changing directory: {e}"
        
    def help_command(self, args):
        return "Available commands: " + ", ".join(self.commands.keys())

    def list_directory(self, args):
        path = args[0] if args else "."
        try:
            return "\n".join(os.listdir(path))
        except Exception as e:
            return f"Error listing directory: {e}"

    def echo_command(self, args):
        if not args:
            return "Error: No text provided to echo."
        return " ".join(args)


    def make_directory(self, args):
        if not args:
            return "Error: No directory name provided."
        try:
            os.mkdir(args[0])
            return f"Directory '{args[0]}' created."
        except Exception as e:
            return f"Error creating directory: {e}"

    def remove_item(self, args):
        if not args:
            return "Error: No file or directory specified."
        try:
            path = args[0]
            if os.path.isdir(path):
                os.rmdir(path)
            else:
                os.remove(path)
            return f"Removed {path}"
        except Exception as e:
            return f"Error removing item: {e}"

    def move_item(self, args):
        if len(args) < 2:
            return "Error: Source and destination required."
        try:
            shutil.move(args[0], args[1])
            return f"Moved {args[0]} to {args[1]}"
        except Exception as e:
            return f"Error moving item: {e}"

    def copy_item(self, args):
        if len(args) < 2:
            return "Error: Source and destination required."
        try:
            shutil.copy(args[0], args[1])
            return f"Copied {args[0]} to {args[1]}"
        except Exception as e:
            return f"Error copying item: {e}"

    def read_file(self, args):
        if not args:
            return "Error: No file specified."
        try:
            with open(args[0], 'r') as file:
                return file.read()
        except Exception as e:
            return f"Error reading file: {e}"

    def touch_file(self, args):
        if not args:
            return "Error: No file specified."
        try:
            with open(args[0], 'a'):
                pass
            return f"File '{args[0]}' created."
        except Exception as e:
            return f"Error creating file: {e}"

    def clear_command(self, args):
        return "Cleared!"  # Placeholder for clear command

    def head_file(self, args):
        try:
            if not args:
                return "Error: No file specified."
            with open(args[0], 'r') as f:
                return ''.join(f.readlines()[:10])
        except Exception as e:
            return f"Error heading file: {e}"

    def tail_file(self, args):
        try:
            if not args:
                return "Error: No file specified."
            with open(args[0], 'r') as f:
                return ''.join(f.readlines()[-10:])
        except Exception as e:
            return f"Error tailing file: {e}"

    def word_count(self, args):
        if not args:
            return "Error: No file specified."
        try:
            with open(args[0], 'r') as file:
                content = file.read()
                lines = content.count("\n")
                words = len(content.split())
                characters = len(content)
                return f"Lines: {lines}, Words: {words}, Characters: {characters}"
        except Exception as e:
            return f"Error in word count: {e}"

    def less_file(self, args):
        if not args:
            return "Error: No file specified."
        try:
            with open(args[0], 'r') as file:
                return ''.join(file.readlines()[:20])  # Simulates 'less' behavior
        except Exception as e:
            return f"Error opening file with 'less': {e}"

    def open_file(self, args):
        if not args:
            return "Error: No file specified."
        try:
            os.startfile(args[0])
            return f"Opened {args[0]}"
        except Exception as e:
            return f"Error opening file: {e}"

    def find_file(self, args):
        if len(args) < 2:
            return "Error: Directory and search term required."
        try:
            results = []
            for root, dirs, files in os.walk(args[0]):
                if args[1] in files:
                    results.append(os.path.join(root, args[1]))
            return "\n".join(results) if results else "No files found."
        except Exception as e:
            return f"Error finding file: {e}"

    def grep_file(self, args):
        if len(args) < 2:
            return "Error: Pattern and file required."
        try:
            with open(args[1], 'r') as file:
                return "\n".join(line for line in file if re.search(args[0], line))
        except Exception as e:
            return f"Error with grep: {e}"

    def get_ip_address(self, args):
        import socket
        try:
            return socket.gethostbyname(socket.gethostname())
        except Exception as e:
            return f"Error getting IP address: {e}"

    def ping_command(self, args):
        if not args:
            return "Error: No host specified."
        try:
            result = subprocess.run(["ping", "-c", "4", args[0]], capture_output=True, text=True)
            return result.stdout
        except Exception as e:
            return f"Error pinging host: {e}"

    def traceroute_command(self, args):
        if not args:
            return "Error: No host specified."
        try:
            command = "tracert" if platform.system() == "Windows" else "traceroute"
            result = subprocess.run([command, args[0]], capture_output=True, text=True)
            return result.stdout
        except Exception as e:
            return f"Error with traceroute: {e}"

    def netstat_command(self, args):
        try:
            result = subprocess.run(["netstat"], capture_output=True, text=True)
            return result.stdout
        except Exception as e:
            return f"Error running netstat: {e}"

    def nslookup_command(self, args):
        if not args:
            return "Error: No host specified."
        try:
            result = subprocess.run(["nslookup", args[0]], capture_output=True, text=True)
            return result.stdout
        except Exception as e:
            return f"Error with nslookup: {e}"

    def tasklist_command(self, args):
        try:
            command = "tasklist" if platform.system() == "Windows" else "ps aux"
            result = subprocess.run(command, shell=True, capture_output=True, text=True)
            return result.stdout
        except Exception as e:
            return f"Error with task list: {e}"
        
    def kill_process(self, args):
        if not args:
            return "Error: No process ID (PID) specified."
        try:
            pid = int(args[0])
            command = ["taskkill", "/PID", str(pid), "/F"] if platform.system() == "Windows" else ["kill", str(pid)]
            result = subprocess.run(command, capture_output=True, text=True)
            if result.returncode == 0:
                return f"Process {pid} terminated successfully."
            return f"Error terminating process {pid}: {result.stderr}"
        except ValueError:
            return "Error: Invalid PID format. Please provide a numeric PID."
        except Exception as e:
            return f"Error killing process: {e}"




    def get_date(self, args):
        return datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    def execute(self, cmd_input: str):
        cmd_parts = cmd_input.strip().split()
        if not cmd_parts:
            return ""
        command = cmd_parts[0].lower()
        args = cmd_parts[1:]
        if command in self.commands:
            return self.commands[command](args)
        return f"Command '{command}' not found."


command_handler = CommandHandler()

@app.post("/process-prompt/")
async def process_prompt(command_req: CommandRequest) -> CommandResponse:
    try:
        response = command_handler.execute(command_req.command)
        return CommandResponse(response=response, pwd=command_handler.current_directory)
    except Exception as e:
        return CommandResponse(response="Error", success=False, error=str(e), pwd=command_handler.current_directory)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
