from flask import Blueprint, jsonify, request
import requests
from bs4 import BeautifulSoup
import random
import time

news_bp = Blueprint('news', __name__)

_news_cache = {
    'articles': [],
    'last_fetched': 0
}
CACHE_TTL = 3600

def fetch_sciencedaily_news():
    """
    Scrapes ScienceDaily for Skin Cancer news.
    """
    url = "https://www.sciencedaily.com/news/health_medicine/skin_cancer/"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    articles = []
    try:
        response = requests.get(url, headers=headers, timeout=5)
        if response.status_code == 200:
            soup = BeautifulSoup(response.content, 'html.parser')
            for item in soup.find_all('div', class_='latest-head'):
                link = item.find('a')
                if link:
                    title = link.text.strip()
                    href = "https://www.sciencedaily.com" + link['href']
                    summary_div = item.find_next_sibling('div', class_='latest-summary')
                    summary = summary_div.text.strip() if summary_div else "No summary available."
                    
                    # Date extraction for ScienceDaily (best effort)
                    # Often follows the title in a small tag or similar
                    date_tag = item.find_next_sibling('div', class_='latest-summary')
                    posted_at = "Recently"
                    if date_tag:
                        # Common format: "March 24, 2024 — ..."
                        date_text = date_tag.text.strip()
                        if ' — ' in date_text:
                            posted_at = date_text.split(' — ')[0]

                    articles.append({
                        "title": title,
                        "summary": summary,
                        "url": href,
                        "source": "ScienceDaily",
                        "image": None,
                        "posted_at": posted_at
                    })
                    if len(articles) >= 12: break
    except Exception as e:
        print(f"ScienceDaily Error: {e}")
        
    return articles

def fetch_medical_news_today():
    """
    Scrapes Medical News Today (Dermatology section).
    Note: MNT structure is complex and dynamic, so this is a best-effort scrape targeting article lists.
    """
    url = "https://www.medicalnewstoday.com/categories/dermatology"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    articles = []
    try:
        response = requests.get(url, headers=headers, timeout=5)
        if response.status_code == 200:
            soup = BeautifulSoup(response.content, 'html.parser')
            # MNT often uses list items with 'css-...' classes. We'll look for generic article links.
            # This selector is an approximation based on common MNT layouts.
            for li in soup.find_all('li', class_=lambda x: x and 'css-' in x):
                link = li.find('a')
                if link and link.get('href', '').startswith('/articles/'):
                    title_tag = link.find('h2') or link.find('h3')
                    if title_tag:
                        title = title_tag.text.strip()
                        href = "https://www.medicalnewstoday.com" + link['href']
                        
                        # Summary might be in a p tag
                        summary_tag = link.find('p')
                        summary = summary_tag.text.strip() if summary_tag else "Click to read more."
                        
                        # Image?
                        img_tag = link.find('img')
                        image = img_tag['src'] if img_tag else None

                        # Date extraction for MNT
                        date_tag = li.find('span', class_=lambda x: x and 'css-' in x and 'date' in x.lower()) or \
                                   li.find('div', class_=lambda x: x and 'css-' in x and 'date' in x.lower())
                        posted_at = date_tag.text.strip() if date_tag else "Recently"

                        articles.append({
                            "title": title,
                            "summary": summary,
                            "url": href,
                            "source": "Medical News Today",
                            "image": image,
                            "posted_at": posted_at
                        })
                        if len(articles) >= 12: break
    except Exception as e:
        print(f"MNT Error: {e}")
    
    return articles

@news_bp.route('/', methods=['GET'])
def get_news():
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 6))
    
    global _news_cache
    
    current_time = time.time()
    
    if current_time - _news_cache['last_fetched'] > CACHE_TTL or not _news_cache['articles']:
        # Fetch from both sources
        articles = []
        articles.extend(fetch_sciencedaily_news())
        articles.extend(fetch_medical_news_today())
        
        # Shuffle to mix sources
        random.shuffle(articles)
        
        _news_cache['articles'] = articles
        _news_cache['last_fetched'] = current_time
    else:
        articles = _news_cache['articles']
    
    # Pagination logic
    total_articles = len(articles)
    total_pages = (total_articles + limit - 1) // limit
    
    start_idx = (page - 1) * limit
    end_idx = start_idx + limit
    
    paginated_articles = articles[start_idx:end_idx]
    
    return jsonify({
        'data': paginated_articles,
        'meta': {
            'current_page': page,
            'total_pages': total_pages,
            'total_items': total_articles,
            'items_per_page': limit
        }
    }), 200
