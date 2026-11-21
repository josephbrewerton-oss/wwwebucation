(module
  ;; AST Vector Media Player — WASM 3D Perspective Projection Engine (v1.0.0)
  ;; Memory Map: Conforms to docs/WASM_ARCHITECTURE_CONTRACT.md (Page 4: 0x040000)
  ;; Memory capacity: 7 pages (448 KiB)
  (memory (export "memory") 7)

  ;; Camera Global Uniforms
  (global $cosYaw (mut f32) (f32.const 1.0))
  (global $sinYaw (mut f32) (f32.const 0.0))
  (global $cosPitch (mut f32) (f32.const 1.0))
  (global $sinPitch (mut f32) (f32.const 0.0))
  (global $cosRoll (mut f32) (f32.const 1.0))
  (global $sinRoll (mut f32) (f32.const 0.0))
  (global $focalLength (mut f32) (f32.const 692.82))
  (global $totalDist (mut f32) (f32.const 450.0))
  (global $originX (mut f32) (f32.const 400.0))
  (global $originY (mut f32) (f32.const 240.0))

  ;; Set camera uniforms once per frame
  (func (export "set_camera_uniforms")
    (param $cy f32) (param $sy f32)
    (param $cp f32) (param $sp f32)
    (param $cr f32) (param $sr f32)
    (param $fl f32) (param $td f32)
    (param $ox f32) (param $oy f32)
    local.get $cy global.set $cosYaw
    local.get $sy global.set $sinYaw
    local.get $cp global.set $cosPitch
    local.get $sp global.set $sinPitch
    local.get $cr global.set $cosRoll
    local.get $sr global.set $sinRoll
    local.get $fl global.set $focalLength
    local.get $td global.set $totalDist
    local.get $ox global.set $originX
    local.get $oy global.set $originY
  )

  ;; Internal projection pipeline for a single vertex
  ;; Output layout (24 bytes): [screenX: f32, screenY: f32, depthZ: f32, scale: f32, opacity: f32, sortRank: i32]
  (func $project_vertex
    (param $x f32) (param $y f32) (param $z f32) (param $outPtr i32) (param $rank i32)
    (local $x1 f32) (local $y1 f32) (local $z1 f32)
    (local $x2 f32) (local $y2 f32) (local $z2 f32)
    (local $x3 f32) (local $y3 f32) (local $z3 f32)
    (local $zCam f32) (local $safeZ f32)
    (local $scale f32) (local $projX f32) (local $projY f32) (local $opacity f32)

    ;; 1. Yaw rotation (Y axis)
    ;; x1 = x * cosY + z * sinY
    local.get $x
    global.get $cosYaw
    f32.mul
    local.get $z
    global.get $sinYaw
    f32.mul
    f32.add
    local.set $x1

    local.get $y
    local.set $y1

    ;; z1 = -x * sinY + z * cosY
    f32.const 0.0
    local.get $x
    global.get $sinYaw
    f32.mul
    f32.sub
    local.get $z
    global.get $cosYaw
    f32.mul
    f32.add
    local.set $z1

    ;; 2. Pitch rotation (X axis)
    local.get $x1
    local.set $x2

    ;; y2 = y1 * cosP - z1 * sinP
    local.get $y1
    global.get $cosPitch
    f32.mul
    local.get $z1
    global.get $sinPitch
    f32.mul
    f32.sub
    local.set $y2

    ;; z2 = y1 * sinP + z1 * cosP
    local.get $y1
    global.get $sinPitch
    f32.mul
    local.get $z1
    global.get $cosPitch
    f32.mul
    f32.add
    local.set $z2

    ;; 3. Roll rotation (Z axis)
    ;; x3 = x2 * cosR - y2 * sinR
    local.get $x2
    global.get $cosRoll
    f32.mul
    local.get $y2
    global.get $sinRoll
    f32.mul
    f32.sub
    local.set $x3

    ;; y3 = x2 * sinR + y2 * cosR
    local.get $x2
    global.get $sinRoll
    f32.mul
    local.get $y2
    global.get $cosRoll
    f32.mul
    f32.add
    local.set $y3

    local.get $z2
    local.set $z3

    ;; 4. Camera distance offset & safe depth clamp
    ;; zCam = z3 + totalDist
    local.get $z3
    global.get $totalDist
    f32.add
    local.set $zCam

    ;; safeZ = max(20.0, zCam)
    local.get $zCam
    f32.const 20.0
    f32.max
    local.set $safeZ

    ;; 5. Perspective division
    ;; scale = focalLength / safeZ
    global.get $focalLength
    local.get $safeZ
    f32.div
    local.set $scale

    ;; projX = originX + x3 * scale
    global.get $originX
    local.get $x3
    local.get $scale
    f32.mul
    f32.add
    local.set $projX

    ;; projY = originY + y3 * scale
    global.get $originY
    local.get $y3
    local.get $scale
    f32.mul
    f32.add
    local.set $projY

    ;; depthOpacity = min(1.0, max(0.45, 0.55 + 0.45 * (scale / (focalLength / totalDist))))
    local.get $scale
    global.get $focalLength
    global.get $totalDist
    f32.div
    f32.div
    f32.const 0.45
    f32.mul
    f32.const 0.55
    f32.add
    f32.const 0.45
    f32.max
    f32.const 1.0
    f32.min
    local.set $opacity

    ;; Store 24-byte struct at outPtr
    ;; offset 0: projX
    local.get $outPtr
    local.get $projX
    f32.store offset=0

    ;; offset 4: projY
    local.get $outPtr
    local.get $projY
    f32.store offset=4

    ;; offset 8: depth_z (z3)
    local.get $outPtr
    local.get $z3
    f32.store offset=8

    ;; offset 12: scale
    local.get $outPtr
    local.get $scale
    f32.store offset=12

    ;; offset 16: opacity
    local.get $outPtr
    local.get $opacity
    f32.store offset=16

    ;; offset 20: sortRank
    local.get $outPtr
    local.get $rank
    i32.store offset=20
  )

  ;; Exported: Project single point into designated memory address
  (func (export "project_single")
    (param $x f32) (param $y f32) (param $z f32) (param $outPtr i32) (param $rank i32)
    local.get $x local.get $y local.get $z local.get $outPtr local.get $rank
    call $project_vertex
  )

  ;; Exported: Project batch of N vertices from inPtr to outPtr
  ;; inPtr: array of [world_x: f32, world_y: f32, world_z: f32, id_hash: i32] (16 bytes each)
  ;; outPtr: array of [screenX: f32, screenY: f32, depthZ: f32, scale: f32, opacity: f32, sortRank: i32] (24 bytes each)
  (func (export "project_batch")
    (param $inPtr i32) (param $outPtr i32) (param $count i32)
    (local $i i32) (local $curIn i32) (local $curOut i32)
    (local $x f32) (local $y f32) (local $z f32)

    i32.const 0
    local.set $i

    block $break
      loop $loop
        local.get $i
        local.get $count
        i32.ge_u
        br_if $break

        ;; curIn = inPtr + i * 16
        local.get $inPtr
        local.get $i
        i32.const 16
        i32.mul
        i32.add
        local.set $curIn

        ;; curOut = outPtr + i * 24
        local.get $outPtr
        local.get $i
        i32.const 24
        i32.mul
        i32.add
        local.set $curOut

        ;; Load world x, y, z
        local.get $curIn
        f32.load offset=0
        local.set $x

        local.get $curIn
        f32.load offset=4
        local.set $y

        local.get $curIn
        f32.load offset=8
        local.set $z

        ;; Project vertex
        local.get $x
        local.get $y
        local.get $z
        local.get $curOut
        local.get $i
        call $project_vertex

        ;; i++
        local.get $i
        i32.const 1
        i32.add
        local.set $i
        br $loop
      end
    end
  )
)
