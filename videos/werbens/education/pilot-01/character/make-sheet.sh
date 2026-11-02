#!/usr/bin/env bash
# Composes character/model-sheet.png from the panels rendered by `node src/render.mjs --sheet` (same rig as the film).
set -euo pipefail
cd "$(dirname "$0")"
F=../fonts/InterDisplay-ExtraBold.otf; S=../fonts/Inter-SemiBold.otf
P=panels; W=300; H=533
row() { # $1=output, rest=panel names
  local out=$1; shift; local inputs=() n=0
  for p in "$@"; do inputs+=(-i "$P/$p.png"); n=$((n+1)); done
  ffmpeg -v error -y "${inputs[@]}" -filter_complex "$(for i in $(seq 0 $((n-1))); do printf "[%d]scale=%d:%d,crop=%d:%d:0:0[p%d];" $i $W $H $W $H $i; done)$(for i in $(seq 0 $((n-1))); do printf "[p%d]" $i; done)hstack=inputs=$n" "$out"
}
row /tmp/r1.png pip_turn_front pip_turn_three pip_turn_side pip_turn_back pip_pose_present pip_pose_point pip_pose_wink
row /tmp/r2.png pip_expr_presenter pip_expr_curious pip_expr_smug pip_expr_shock pip_expr_wink pip_expr_sheepish quibble_expr_sceptic
row /tmp/r3.png quibble_turn_front quibble_turn_three quibble_turn_side quibble_turn_back quibble_pose_crossed quibble_pose_point quibble_pose_shrug
row /tmp/r4.png quibble_expr_squint quibble_expr_delight quibble_expr_meh quibble_expr_shock quibble_expr_sheepish quibble_expr_sceptic quibble_expr_squint
ffmpeg -v error -y -i /tmp/r1.png -i /tmp/r2.png -i /tmp/r3.png -i /tmp/r4.png -filter_complex "[0][1][2][3]vstack=4,pad=iw:ih+230:0:230:color=#140B33,
drawtext=fontfile=$F:text='Werbens · Education series cast — model sheet':x=40:y=36:fontsize=56:fontcolor=#F0EAFC,
drawtext=fontfile=$S:text='PIP (host / ad director) — violet #6234FB capsule · lavender #CCC0F7 beret · ink #1B1433 headset boom mic':x=40:y=112:fontsize=26:fontcolor=#C9B8FF,
drawtext=fontfile=$S:text='QUIBBLE (sceptical customer, silent) — pale #EEE9FB block · round ink glasses · single top curl · heavy brows':x=40:y=148:fontsize=26:fontcolor=#C9B8FF,
drawtext=fontfile=$S:text='Rendered from the production rig (src/rig/*.js): turnaround · action poses · expression presets. Original designs; palette sampled from the Werbens icon.':x=40:y=188:fontsize=22:fontcolor=#A99FD0" model-sheet.png
rm -f /tmp/r1.png /tmp/r2.png /tmp/r3.png /tmp/r4.png
echo "wrote character/model-sheet.png"
