import json
import urllib.request

url = "https://raw.githubusercontent.com/emilbayes/eff-diceware-passphrase/master/wordlist.json"
response = urllib.request.urlopen(url)
words = json.loads(response.read().decode())

js_content = f"const EFF_WORDLIST = {json.dumps(words)};"

with open(r"c:\Users\Pasi\.gemini\antigravity\scratch\multi_tool_hub\static\js\eff_wordlist.js", "w") as f:
    f.write(js_content)

print(f"Successfully wrote {len(words)} words to eff_wordlist.js")
