import textract, validators
from youtube_transcript_api import YouTubeTranscriptApi
from urllib.parse import urlparse, parse_qs
from bs4 import BeautifulSoup
import os, requests, random

random.seed(42)

def parse_text_file(file_path):
    with open(file_path, "r") as file:
        text = file.read()
    return {"link": file_path, "type": "plaintext", "content": text.strip()}
    
def parse_docx_file(file_path):
    text = textract.process(file_path)
    text = text.decode("utf-8")
    return {"link": file_path, "type": "plaintext", "content": text.strip()}

def parse_pdf_file(file_path):
    text = textract.process(file_path, method='pdfminer')
    text = text.decode("utf-8")
    return {"link": file_path, "type": "plaintext", "content": text.strip()}

def youtube_transcript(link):
    try:
        v = parse_qs(link.query).get('v')
        if v:
            id = v[0]
        transcript = YouTubeTranscriptApi.get_transcript(id)
        text = "\n".join([entry['text'] for entry in transcript])
        return {"link": link, "type": "video", "content": text.strip()}
    except Exception as e:
        return {"link": link, "type": "Error: No Transcript Found" , "content": "N/A"}

def parse_web_content(response):
    soup = BeautifulSoup(response.content, "html.parser")
    text = " ".join([p.text for p in soup.find_all(["p", "h1", "h2", "h3", "h4", "h5", "h6", "li"])])
    return {"link": response, "type": "plaintext", "content": text.strip()}


def check_link_content(link):
    """Determines whether the link is a PDF, Doc, Docx, Youtube or plaintext and extracts content if plaintext."""
    
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36"}
    i = 0
    while i < 50:
        response = requests.get(link, headers=headers, stream=True)
        if response.status_code == 200:
            break
        i += 1
    else: 
        return {"link": "No link found.",
                "type": "Error: Cannot retrieve link"}
    
    content_type = response.headers.get("Content-Type", "").lower()
    parsed_url = urlparse(link)
    if 'youtube.com' in parsed_url.netloc:
        return youtube_transcript(parsed_url)

    if "application/pdf" in content_type:
        file_name = f'file_{random.randint(0, 1000)}.pdf'
        with open(file_name, "wb") as file:
            for chunk in response.iter_content(chunk_size=8192):
                file.write(chunk)
        print(f"✅ PDF downloaded successfully: {'./'}")
        out = parse_pdf_file(file_name)
        if os.path.exists(file_name):
            os.remove(file_name)
        return out
    
    elif "text/plain" in content_type:
        file_name = f'file_{random.randint(0, 1000)}.txt'
        with open(file_name, "wb") as file:
            for chunk in response.iter_content(chunk_size=8192):
                file.write(chunk)
        print(f"✅ Txt downloaded successfully: {'./'}")
        out = parse_text_file(file_name)
        if os.path.exists(file_name):
            os.remove(file_name)
        return out
    
    elif "text/html" in content_type:
        return parse_web_content(response)

    elif "application/vnd.openxmlformats-officedocument.wordprocessingml.document" in content_type:
        file_name = f'file_{random.randint(0, 1000)}.docx'
        with open(file_name, "wb") as file:
            for chunk in response.iter_content(chunk_size=8192):
                file.write(chunk)
        print(f"✅ Docx downloaded successfully: {'./'}")
        out = parse_docx_file(file_name)
        if os.path.exists(file_name):
            os.remove(file_name)
        return out
    
    else:
        return {"link": link, "type": "Error: Unsupported content type."}

def main(input_path):
    """
    main function
    """
    if validators.url(input_path) is True:
        return check_link_content(input_path)
    if input_path.endswith('.txt'):
        return parse_text_file(input_path)
    elif input_path.endswith('.docx'):
        return parse_docx_file(input_path)
    elif input_path.endswith('.pdf'):
        return parse_pdf_file(input_path)
    else:
        return {"link": input_path, "type": "Error: Unsupported file type."}
    
if __name__=="__main__":
    pass