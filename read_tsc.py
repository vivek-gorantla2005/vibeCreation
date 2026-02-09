with open('tsc_output.txt', 'rb') as f:
    content = f.read()
    if content.startswith(b'\xff\xfe'): # UTF-16 LE BOM
        text = content.decode('utf-16')
    else:
        text = content.decode('utf-8', errors='ignore')
    print(text)
