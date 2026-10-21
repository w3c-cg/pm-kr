"""Replay the completed Flash protocol through an already configured Ollama.

Usage: python3 run-ollama.py /path/to/new-output-directory
Uses the cloud model named below; requests consume the operator's quota.
Does not install models, change configuration, or publish results.
"""
from datetime import datetime, timezone
from pathlib import Path
import hashlib
import json
import sys
import time
import urllib.request

ROOT = Path(__file__).resolve().parent
MODEL = 'deepseek-v4.1-flash:cloud'


def main():
    if len(sys.argv) != 2:
        raise SystemExit('Usage: python3 run-ollama.py NEW_OUTPUT_DIRECTORY')
    output = Path(sys.argv[1])
    output.mkdir(parents=True, exist_ok=False)
    for index, (condition, seed) in enumerate(
            [('a', 41021), ('b', 41021), ('b', 41022), ('a', 41022)], 1):
        name = f'run-{index}-{condition}'
        prompt = (ROOT / 'prompts' / (condition + '.txt')).read_text()
        request = dict(model=MODEL, stream=False, think=False,
                       messages=[dict(role='user', content=prompt)],
                       options=dict(temperature=0.3, seed=seed, num_predict=8192))
        (output / (name + '-request.json')).write_text(json.dumps(request, indent=2) + '\n')
        started = datetime.now(timezone.utc).isoformat()
        clock = time.monotonic()
        req = urllib.request.Request('http://localhost:11434/api/chat',
            data=json.dumps(request).encode(), headers={'Content-Type': 'application/json'})
        with urllib.request.urlopen(req, timeout=300) as response:
            result = json.load(response)
        (output / (name + '-raw.json')).write_text(json.dumps(result, indent=2) + '\n')
        content = result.get('message', {}).get('content', '')
        (output / (name + '.md')).write_text(content)
        fields = ['model', 'created_at', 'done', 'done_reason', 'total_duration',
                  'load_duration', 'prompt_eval_count', 'prompt_eval_duration',
                  'eval_count', 'eval_duration']
        metadata = {key: result[key] for key in fields if key in result}
        metadata.update(condition=condition, started_utc=started,
            wall_seconds=round(time.monotonic() - clock, 3),
            content_sha256=hashlib.sha256(content.encode()).hexdigest(),
            content_characters=len(content))
        (output / (name + '-metadata.json')).write_text(json.dumps(metadata, indent=2) + '\n')
        print(name, metadata.get('done_reason'), flush=True)
        if not content or not result.get('done') or result.get('done_reason') == 'length':
            raise SystemExit('Incomplete response retained; stopping without a silent retry.')


if __name__ == '__main__':
    main()
