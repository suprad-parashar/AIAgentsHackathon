import textract
from youtube_transcript_api import YouTubeTranscriptApi
from urllib.parse import urlparse, parse_qs
from bs4 import BeautifulSoup
import json, os, requests, random

random.seed(42)

def parse_text_file(file_path):
    with open(file_path, "r") as file:
        text = file.read()
        return {"link": file_path, "type": "plaintext", "content": text}
    
def parse_docx_file(file_path):
    text = textract.process(file_path)
    text = text.decode("utf-8")
    return {"link": file_path, "type": "plaintext", "content": text}

def parse_pdf_file(file_path):
    text = textract.process(file_path, method='pdfminer')
    text = text.decode("utf-8")
    return {"link": file_path, "type": "plaintext", "content": text}

def youtube_transcript(link):
    try:
        v = parse_qs(link.query).get('v')
        if v:
            id = v[0]
        transcript = YouTubeTranscriptApi.get_transcript(id)
        text = "\n".join([entry['text'] for entry in transcript])
        return {"link": link, "type": "video", "content": text}
    except Exception as e:
        return {"link": link, "type": "Error: No Transcript Found" , "content": "N/A"}

def parse_web_content(response):
    soup = BeautifulSoup(response.content, "html.parser")
    text = " ".join([p.text for p in soup.find_all(["p", "h1", "h2", "h3", "h4", "h5", "h6", "li"])])
    return {"link": response, "type": "plaintext", "content": text}


def check_link_content(link):
    """Determines whether the link is a PDF or plaintext and extracts content if plaintext."""
    
    if not link:
        return {"link": "No link found.",
                "type": "Error: No link found"}
    
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
        with open('./file.pdf', "wb") as file:
            for chunk in response.iter_content(chunk_size=8192):
                file.write(chunk)
        print(f"✅ PDF downloaded successfully: {'./'}")
        return parse_pdf_file('./file.pdf')
    
    elif "text/plain" in content_type:
        return parse_text_file(response)
    
    elif "text/html" in content_type:
        return parse_web_content(response)
    
    elif "application/msword" in content_type:
        with open('./file.doc', "wb") as file:
            for chunk in response.iter_content(chunk_size=8192):
                file.write(chunk)
        print(f"✅ Doc downloaded successfully: {'./'}")
        return parse_docx_file(response)
    
    elif "application/vnd.openxmlformats-officedocument.wordprocessingml.document" in content_type:
        with open('./file.docx', "wb") as file:
            for chunk in response.iter_content(chunk_size=8192):
                file.write(chunk)
        print(f"✅ Docx downloaded successfully: {'./'}")
        return parse_docx_file(response)
    
    else:
        return {"link": link, 
                "type": "Error: Unsupported content type."}

def main():
    """
    main function
    """
    print(json.dumps(response, indent=4))
    if os.path.exists('./file.pdf'):
        os.remove('./file.pdf')
    pass
    
    
if __name__=="__main__":
    main()