# pip install vedo opencv-python numpy-stl
import math
import cv2
from vedo import load, Plotter, Light

STL_PATH = "ace_assembly.stl"
W, H = 960, 720
FPS = 30
N_FRAMES = 360
OUTPUT = "spin.mp4"  # set to None to skip saving
OFFSCREEN = False    # if you get a white frame, try False first

# ---- Load & normalize mesh ----
mesh = load(STL_PATH).c("lightgray")
mesh = mesh.normalize()         # scale to ~unit box
mesh.pos(0, 0, 0)               # center

# bounds/center/radius for camera path
cx, cy, cz = mesh.center_of_mass()
_, _, _, _, _, _ = mesh.bounds()
r = mesh.diagonal_size() * 1.2   # comfortable distance
elev_amp = r * 0.15             # gentle up-down wobble

# ---- Plotter ----
vp = Plotter(size=(W, H), offscreen=OFFSCREEN, bg="white")
vp += [mesh, Light(pos=(5, -5, 8), c="white", intensity=1.0)]
cam = vp.camera
cam.SetFocalPoint(cx, cy, cz)
cam.SetViewUp(0, 0, 1)

# ---- Video writer ----
writer = None
if OUTPUT:
    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    writer = cv2.VideoWriter(OUTPUT, fourcc, FPS, (W, H))

# ---- Turntable loop ----
for i in range(N_FRAMES):
    theta = 2 * math.pi * (i / N_FRAMES)
    x = cx + r * math.sin(theta)
    y = cy + r * math.cos(theta)
    z = cz + elev_amp * math.sin(theta * 0.5)  # slow tilt
    cam.SetPosition(x, y, z)

    # render and grab image
    vp.show(resetcam=False)  # draw once; no camera reset
    img = vp.screenshot(asarray=True)  # RGB
    if img is None:
        break  # safety if offscreen fails

    img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)
    cv2.imshow("STL Turntable", img)
    if writer:
        writer.write(img)

    if cv2.waitKey(1) & 0xFF == 27:  # ESC to quit
        break

vp.close()
if writer:
    writer.release()
cv2.destroyAllWindows()
