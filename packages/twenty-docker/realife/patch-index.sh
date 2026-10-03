#!/bin/sh
# Twenty の index.html に Realife のモバイル用 CSS を差し込む。
# コンテナ起動時に docker-compose.override.yml から呼ばれる。手で何度実行してもよい。
# どこで失敗しても Twenty の起動は止めない（常に exit 0）。

SRC=${REALIFE_CSS:-/realife/realife-mobile.css}
FRONT=/app/packages/twenty-server/dist/front
INDEX="$FRONT/index.html"

if [ ! -f "$SRC" ] || [ ! -f "$INDEX" ]; then
  echo "[realife] CSS か index.html が見つからないので何もしない"
  exit 0
fi

cp "$SRC" "$FRONT/realife-mobile.css" || exit 0

# CSS を更新したらブラウザのキャッシュが外れるよう、中身のハッシュを付ける
VERSION=$(md5sum "$SRC" | cut -c1-8)
TAG="<link rel=\"stylesheet\" href=\"/realife-mobile.css?v=$VERSION\" data-realife>"

# 前回差し込んだ行を消してから入れ直す
sed -i '/data-realife/d' "$INDEX" || exit 0
sed -i "s#</head>#    $TAG\n  </head>#" "$INDEX" || exit 0

echo "[realife] モバイル用 CSS を差し込んだ (v=$VERSION)"
exit 0
