import sys
import subprocess
import os
import re
import logging
from api import app
import threading

logging.basicConfig(level=logging.DEBUG, filename="shell_debug.log", filemode="w",
                    format="%(asctime)s - %(levelname)s - %(message)s")

def translate_command(command):
    """Translate Unix-like commands to Windows commands if needed."""
    parts = command.split()
    base_cmd = parts[0]
    
    if base_cmd == "cd":
        if len(parts) > 1:
            return f"cd {parts[1]}"  
        else:
            return "cd" 
    if base_cmd == "ls":
        return "dir"  
    elif base_cmd == "mkdir":
        return command  # mkdir works the same in both systems
    elif base_cmd == "rm":
        if len(parts) > 1:
            path = parts[1]
            if os.path.isdir(path):
                return f"rmdir /s /q {path}"  # Remove directory in Windows
            else:
                return f"del {path}"  # Delete file in Windows
    elif base_cmd == "mv":
        if len(parts) > 2:
            return f"move {parts[1]} {parts[2]}"
    elif base_cmd == "cp":
        if len(parts) > 2:
            return f"copy {parts[1]} {parts[2]}"
    elif base_cmd == "cat":
        if len(parts) > 1:
            return f"type {parts[1]}"
    elif base_cmd == "echo":
        return command  # Echo is the same in both systems
    elif base_cmd == "touch":
        if len(parts) > 1:
            open(parts[1], 'a').close()  # Create an empty file
            return ""  # No command execution needed
    elif base_cmd == "clear":
        return "cls"  # Clear screen command in Windows
    elif base_cmd == "head":
        if len(parts) > 1:
            return f"powershell -Command \"Get-Content {parts[1]} -TotalCount 10\""  # Print top 10 lines
    elif base_cmd == "tail":
        if len(parts) > 1:
            return f"powershell -Command \"Get-Content {parts[1]} -Tail 10\""  # Print bottom 10 lines
    elif base_cmd == "wc":
        if len(parts) > 1:
            return handle_wc(parts[1])  # Count lines, words, characters
    elif base_cmd == "less":
        if len(parts) > 1:
            return f"powershell -Command \"Get-Content {parts[1]} | more\""  # Simulating less
    elif base_cmd == "open":
        if len(parts) > 1:
            return f"start {parts[1]}"  # Open file in default editor
    elif base_cmd == "find":
        if len(parts) > 1:
            directory = parts[1]
            name_filter = parts[2] if len(parts) > 2 and parts[2].startswith("-name") else None
            return handle_find(directory, name_filter)
    elif base_cmd == "grep":
        if len(parts) > 2:
            pattern = parts[1]
            file_path = parts[2]
            return handle_grep(pattern, file_path)
    elif base_cmd == "ip":
        return translate_ip_command(parts)  # Handle ip commands
    elif base_cmd == "ping":
        return command  # Ping works the same in both systems
    elif base_cmd == "traceroute":
        return f"tracert {' '.join(parts[1:])}"  # Windows equivalent of traceroute
    elif base_cmd == "netstat":
        return command  # Netstat works the same in both systems
    elif base_cmd == "nslookup":
        return command  # Nslookup works the same in both systems
    elif base_cmd in ["top", "htop"]:
        return handle_top_htop(base_cmd)
    elif base_cmd == "ps":
        return handle_ps(parts[1] if len(parts) > 1 else "")
    elif base_cmd == "kill":
        if len(parts) > 1:
            return handle_kill(parts[1])  # Kill process by PID or name
    elif base_cmd == "date":
        return "powershell -Command \"Get-Date\""  # Display current date and time 
    return command

def translate_ip_command(parts):
    """Translate ip commands to Windows equivalents."""
    if "addr" in parts or "link" in parts:
        return "ipconfig"  # Display IP address info
    elif "route" in parts:
        return "route print"  # Display routing table
    elif "netns" in parts:
        return "netsh interface show interface"  # Display network interfaces
    return "ipconfig"

def handle_top_htop(command):
    """Simulate the top or htop command."""
    # For simplicity, we use 'tasklist' on Windows which is the equivalent of `ps`
    if command == "top":
        return "tasklist"  # Top is not directly available on Windows
    elif command == "htop":
        return "tasklist"  # Htop is also not directly available on Windows
    return ""

def handle_ps(args):
    """Simulate the ps command."""
    if args in ["", "-a", "-u", "-x"]:
        return "tasklist"
    return ""

def handle_kill(arg):
    """Simulate the kill command to terminate processes."""
    if arg.isdigit():  # If the argument is a PID
        return f"taskkill /PID {arg} /F"  # Force kill the process
    else:  # Otherwise, assume it's a process name
        return f"taskkill /IM {arg} /F"  # Force kill the process by image name

def check_file_type(file_path):
    """Determine the type of a file based on its extension or content."""
    if not os.path.isfile(file_path):
        sys.stdout.write(f"file: `{file_path}`: No such file\n")
        return ""
    
    # Checking file extension
    extension = os.path.splitext(file_path)[1].lower()
    
    # Mapping of extensions to file types
    file_types = {
        ".txt": "ASCII text",
        ".csv": "CSV (Comma Separated Values) text",
        ".json": "JSON (JavaScript Object Notation) text",
        ".xml": "XML (Extensible Markup Language) text",
        ".html": "HTML (Hypertext Markup Language) document",
        ".css": "CSS (Cascading Style Sheets) text",
        ".js": "JavaScript source code",
        ".py": "Python script",
        ".java": "Java source code",
        ".c": "C source code",
        ".cpp": "C++ source code",
        ".jpg": "JPEG image data",
        ".jpeg": "JPEG image data",
        ".png": "PNG image data",
        ".gif": "GIF image data",
        ".bmp": "BMP (Bitmap) image data",
        ".svg": "SVG (Scalable Vector Graphics) image data",
        ".pdf": "PDF (Portable Document Format) document",
        ".doc": "Microsoft Word 97-2003 document",
        ".docx": "Microsoft Word document",
        ".xls": "Microsoft Excel 97-2003 spreadsheet",
        ".xlsx": "Microsoft Excel spreadsheet",
        ".ppt": "Microsoft PowerPoint 97-2003 presentation",
        ".pptx": "Microsoft PowerPoint presentation",
        ".zip": "ZIP archive",
        ".tar": "TAR archive",
        ".gz": "GZIP compressed data",
        ".rar": "RAR archive",
        ".exe": "Windows executable",
        ".dll": "Windows dynamic link library",
        ".iso": "ISO disk image",
        ".mp3": "MP3 audio file",
        ".wav": "WAV audio file",
        ".mp4": "MP4 video file",
        ".avi": "AVI video file",
        ".mkv": "MKV (Matroska) video file",
        ".flv": "FLV (Flash Video) file",
        ".md": "Markdown text file",
    }
    
    # Check if the extension is known
    if extension in file_types:
        file_type = file_types[extension]
    else:
        file_type = "Unknown type"
    
    # Optional: More detailed check for specific types could be added here

    result = f"{file_path}: {file_type}\n"
    sys.stdout.write(result)
    return ""

def handle_redirection(command):
    """Handle command redirection like 'cat > filename'."""
    if '>' in command:
        parts = command.split('>')
        left_side = parts[0].strip().split()
        right_side = parts[1].strip()
        
        # Handle cat > file.txt
        if left_side[0] == "cat":
            file_name = right_side
            sys.stdout.write("Enter content \n")
            content = sys.stdin.read()  # Reads input until EOF (Ctrl+D)
            with open(file_name, 'w') as file:
                file.write(content)
            return ""
    return command

def handle_wc(file_path):
    """Simulates wc command to count lines, words, and characters."""
    if not os.path.isfile(file_path):
        sys.stdout.write(f"wc: `{file_path}`: No such file\n")
        return ""
    
    with open(file_path, "r") as file:
        content = file.read()
        lines = content.splitlines()
        words = content.split()
        characters = len(content)

        result = f"{len(lines)} {len(words)} {characters} {file_path}\n"
        sys.stdout.write(result)
    return ""

def handle_find(directory, name_filter=None):
    """Simulates basic find functionality."""
    if not os.path.isdir(directory):
        sys.stdout.write(f"find: `{directory}`: No such file or directory\n")
        return ""
    
    # Extract filename pattern if provided
    pattern = name_filter.split("=", 1)[1] if name_filter and "=" in name_filter else "*"
    
    matches = []
    for root, _, files in os.walk(directory):
        for file in files:
            if re.fullmatch(pattern.replace("*", ".*"), file):
                matches.append(os.path.join(root, file))
    
    if matches:
        sys.stdout.write("\n".join(matches) + "\n")
    else:
        sys.stdout.write(f"No files found matching pattern `{pattern}` in `{directory}`\n")
    return ""

def handle_grep(pattern, file_path):
    """Simulates basic grep functionality."""
    if not os.path.isfile(file_path):
        sys.stdout.write(f"grep: `{file_path}`: No such file\n")
        return ""
    
    with open(file_path, "r") as file:
        for line in file:
            if re.search(pattern, line):
                sys.stdout.write(line)
    return ""

def execute_command(command):
    """Execute the translated command and return the result."""
    try:
        logging.debug(f"Executing command: {command}")
        command = translate_command(command)
        
        if not command.strip():
            return "Invalid command\n"

        parts = command.split()
        base_cmd = parts[0]

        # Handle 'cd' command directly
        if base_cmd == "cd":
            if len(parts) > 1:
                target_dir = parts[1]
                try:
                    os.chdir(target_dir)  # Change current working directory
                    return f"Changed directory to: {os.getcwd()}\n"
                except FileNotFoundError:
                    return f"cd: {target_dir}: No such file or directory\n"
                except PermissionError:
                    return f"cd: {target_dir}: Permission denied\n"
            else:
                # No directory specified; go to home directory
                os.chdir(os.path.expanduser("~"))
                return f"Changed directory to: {os.getcwd()}\n"

        # Handle other commands as before
        process = subprocess.Popen(
            command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE
        )
        stdout, stderr = process.communicate()

        result = ""
        if stdout:
            result += stdout.decode()
        if stderr:
            result += stderr.decode()

        logging.debug(f"Command output: {result}")
        return result
    except Exception as e:
        logging.error(f"Error executing command: {e}")
        return f"Error: {e}\n"

def start_fastapi():
    """Run the FastAPI server in a separate thread."""
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)

def main():
    try:
        # Start FastAPI server in a separate thread
        server_thread = threading.Thread(target=start_fastapi, daemon=True)
        server_thread.start()
        
        # Interactive shell functionality
        while True:
            sys.stdout.write("$ ")
            sys.stdout.flush()
            
            command = input().strip()
            
            if command.lower() == 'exit':
                break
            
            execute_command(command)
    except KeyboardInterrupt:
        sys.stdout.write("\nSession terminated.\n")
    except EOFError:
        sys.stdout.write("\nExiting shell.\n")

if __name__ == "__main__":
    main()