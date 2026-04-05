import json
import os
import re
from html.parser import HTMLParser

class FAQParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.in_card = False
        self.in_h3 = False
        self.in_p_or_li = False
        self.current_q = ''
        self.current_a = []
        self.faqs = [] # List of tuples (Q, A) to preserve order
        self.div_depth = 0
        self.card_depth = 0

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        if tag == 'div':
            self.div_depth += 1
            if 'class' in attrs_dict and 'faq-card' in attrs_dict['class']:
                self.in_card = True
                self.card_depth = self.div_depth
                self.current_q = ''
                self.current_a = []
        elif self.in_card:
            if tag == 'h3':
                self.in_h3 = True
            elif tag in ['p', 'li']:
                self.in_p_or_li = True
            elif tag == 'br':
                if self.in_p_or_li:
                    self.current_a.append(" ")

    def handle_endtag(self, tag):
        if tag == 'div':
            if self.in_card and self.div_depth == self.card_depth:
                self.in_card = False
                if self.current_q:
                    self.faqs.append((self.current_q.strip(), " ".join(self.current_a).strip()))
            self.div_depth -= 1
        elif self.in_card:
            if tag == 'h3':
                self.in_h3 = False
            elif tag in ['p', 'li']:
                self.in_p_or_li = False

    def handle_data(self, data):
        if self.in_card:
            text = re.sub(r'\s+', ' ', data)
            if not text.strip():
                if self.in_p_or_li and " " in data:
                     self.current_a.append(" ")
                return
            if self.in_h3:
                self.current_q += text
            elif self.in_p_or_li:
                self.current_a.append(text.strip())

def normalize_text(t):
    return re.sub(r'\s+', ' ', t).strip()

template_dir = 'templates'
for fname in os.listdir(template_dir):
    if not fname.endswith('.html'): continue
    filepath = os.path.join(template_dir, fname)
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    if fname in ['username_checker.html', 'color_guessing_game.html']:
        continue

    parser = FAQParser()
    parser.feed(content)
    
    if not parser.faqs:
        continue
        
    main_entity = []
    for q, a in parser.faqs:
        clean_q = normalize_text(q)
        clean_a = normalize_text(a).replace(" ,", ",").replace(" .", ".").replace(" '", "'")
        main_entity.append({
            "@type": "Question",
            "name": clean_q,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": clean_a
            }
        })
        
    faq_schema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": main_entity
    }
    
    json_str = json.dumps(faq_schema, indent=2, ensure_ascii=False)
    script_block = f'<script type="application/ld+json">\n{json_str}\n</script>'
    
    pattern = re.compile(r'<script type=["\']application/ld\+json["\']>\s*{[^}]*"@type"\s*:\s*"FAQPage"((?!</script>).)*</script>', re.DOTALL)
    
    if pattern.search(content):
        # Use a lambda to avoid backslash escaping issues in repl!
        new_content = pattern.sub(lambda m: script_block, content)
    else:
        # Fallback 1: Append to head
        if '</head>' in content:
            new_content = content.replace('</head>', script_block + '\n</head>')
        # Fallback 2: Append before {% block content %}
        elif '{% block content %}' in content:
            new_content = content.replace('{% block content %}', script_block + '\n{% block content %}')
        else:
            print(f"[{fname}] Could not find insert location. Skipping.")
            continue
            
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {fname}")
