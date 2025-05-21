# make_base64.py
import base64, sys

in_path = sys.argv[1]    # örn: samples/test.m4a
out_path = sys.argv[2]   # örn: samples/test.m4a.base64

with open(in_path, "rb") as f:
    b64 = base64.b64encode(f.read()).decode("utf-8")
with open(out_path, "w") as f:
    f.write(b64)

print("✅ Base64 yazıldı:", out_path)
