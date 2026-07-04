from pathlib import Path

import mat3ra

# Editable installs add src/py via .pth, but site-packages/mat3ra (from mat3ra-fixtures)
# is resolved first and does not include mat3ra.regex. Extend the namespace path so local
# regex sources are visible alongside fixtures and utils.
_REGEX_MAT3RA_SRC = Path(__file__).resolve().parents[2] / "src" / "py" / "mat3ra"
_path = str(_REGEX_MAT3RA_SRC)
if _path not in mat3ra.__path__:
    mat3ra.__path__.append(_path)
