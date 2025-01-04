from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from typing import Optional
import platform

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
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class CommandHandler:
    def __init__(self):
        self.commands = {
            'help': self.help_command,
            'echo': self.echo_command,
            'clear': self.clear_command,
            'whoami': self.whoami_command,
            'pwd': self.pwd_command,
            'system': self.system_info,
            'date': self.get_date,
            'ls': self.list_directory,
            'version': self.version_info,
        }

    def help_command(self, args):
        return """Available commands:
help - Show this help message
echo [text] - Display text
clear - Clear the terminal
whoami - Show current user
pwd - Show current directory
system - Show system information
date - Show current date and time
ls - List directory contents
version - Show PawShell version"""

    def echo_command(self, args):
        return ' '.join(args)

    def clear_command(self, args):
        return 'CLEAR_TERMINAL'

    def whoami_command(self, args):
        return os.getenv('USER', 'madpacker')

    def pwd_command(self, args):
        return os.getcwd()

    def system_info(self, args):
        return f"""System Information:
OS: {platform.system()} {platform.release()}
Architecture: {platform.machine()}
Python Version: {platform.python_version()}"""

    def get_date(self, args):
        from datetime import datetime
        return datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    def list_directory(self, args):
        try:
            path = args[0] if args else '.'
            items = os.listdir(path)
            return '\n'.join(items)
        except Exception as e:
            return f"Error listing directory: {str(e)}"

    def version_info(self, args):
        return "PawShell v1.0.0 - Developed by Deepak Sharma"

    def execute(self, cmd_input: str) -> str:
        parts = cmd_input.strip().split()
        if not parts:
            return ''
        
        command = parts[0].lower()
        args = parts[1:]

        if command in self.commands:
            try:
                return self.commands[command](args)
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Command execution failed: {str(e)}")
        else:
            return f"Command not found: {command}. Type 'help' for available commands."

command_handler = CommandHandler()

@app.get("/")
def read_root():
    return {"message": "Welcome to PawShell Backend!"}

@app.post("/process-prompt/")
async def process_prompt(command_req: CommandRequest) -> CommandResponse:
    try:
        response = command_handler.execute(command_req.command)
        return CommandResponse(response=response)
    except HTTPException as e:
        return CommandResponse(
            response=str(e.detail),
            success=False,
            error=str(e.detail)
        )
    except Exception as e:
        return CommandResponse(
            response="Internal server error",
            success=False,
            error=str(e)
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)