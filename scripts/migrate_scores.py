import json
import os

def migrate_scores(file_path):
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        return

    with open(file_path, 'r') as f:
        data = json.load(f)

    print(f"Reducing {len(data)} scores by 20%...")
    
    for entry in data:
        old_score = entry.get('score', 0)
        # Apply 20% reduction (multiplier 0.8), rounding to nearest integer
        new_score = int(round(old_score * 0.8))
        entry['score'] = new_score
        
    with open(file_path, 'w') as f:
        json.dump(data, f)
    
    print("Migration complete.")

if __name__ == "__main__":
    db_file = 'data/jnd_quest_global.json'
    migrate_scores(db_file)
