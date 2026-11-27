(module
  ;; ===========================================================================
  ;; St Joseph's Educational Media Suite — AST Vector Engine WebAssembly Core
  ;; Conforms to docs/WASM_ARCHITECTURE_CONTRACT.md
  ;; Memory capacity: 7 pages (448 KiB, 64-bit aligned)
  ;; ===========================================================================
  (memory (export "memory") 7)

  ;; ---------------------------------------------------------------------------
  ;; PAGE 4: 3D PERSPECTIVE PROJECTION PIPELINE (0x040000 = 262144)
  ;; ---------------------------------------------------------------------------
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

  (func $project_vertex
    (param $x f32) (param $y f32) (param $z f32) (param $outPtr i32) (param $rank i32)
    (local $x1 f32) (local $y1 f32) (local $z1 f32)
    (local $x2 f32) (local $y2 f32) (local $z2 f32)
    (local $x3 f32) (local $y3 f32) (local $z3 f32)
    (local $zCam f32) (local $safeZ f32)
    (local $scale f32) (local $projX f32) (local $projY f32) (local $opacity f32)

    ;; 1. Yaw rotation (Y axis)
    local.get $x global.get $cosYaw f32.mul local.get $z global.get $sinYaw f32.mul f32.add local.set $x1
    local.get $y local.set $y1
    f32.const 0.0 local.get $x global.get $sinYaw f32.mul f32.sub local.get $z global.get $cosYaw f32.mul f32.add local.set $z1

    ;; 2. Pitch rotation (X axis)
    local.get $x1 local.set $x2
    local.get $y1 global.get $cosPitch f32.mul local.get $z1 global.get $sinPitch f32.mul f32.sub local.set $y2
    local.get $y1 global.get $sinPitch f32.mul local.get $z1 global.get $cosPitch f32.mul f32.add local.set $z2

    ;; 3. Roll rotation (Z axis)
    local.get $x2 global.get $cosRoll f32.mul local.get $y2 global.get $sinRoll f32.mul f32.sub local.set $x3
    local.get $x2 global.get $sinRoll f32.mul local.get $y2 global.get $cosRoll f32.mul f32.add local.set $y3
    local.get $z2 local.set $z3

    ;; 4. Camera distance offset & safe depth
    local.get $z3 global.get $totalDist f32.add local.set $zCam
    local.get $zCam f32.const 20.0 f32.max local.set $safeZ

    ;; 5. Perspective division
    global.get $focalLength local.get $safeZ f32.div local.set $scale
    global.get $originX local.get $x3 local.get $scale f32.mul f32.add local.set $projX
    global.get $originY local.get $y3 local.get $scale f32.mul f32.add local.set $projY

    local.get $scale global.get $focalLength global.get $totalDist f32.div f32.div f32.const 0.45 f32.mul f32.const 0.55 f32.add f32.const 0.45 f32.max f32.const 1.0 f32.min local.set $opacity

    ;; Store 24 bytes at outPtr
    local.get $outPtr local.get $projX f32.store offset=0
    local.get $outPtr local.get $projY f32.store offset=4
    local.get $outPtr local.get $z3 f32.store offset=8
    local.get $outPtr local.get $scale f32.store offset=12
    local.get $outPtr local.get $opacity f32.store offset=16
    local.get $outPtr local.get $rank i32.store offset=20
  )

  (func (export "project_single")
    (param $x f32) (param $y f32) (param $z f32) (param $outPtr i32) (param $rank i32)
    local.get $x local.get $y local.get $z local.get $outPtr local.get $rank
    call $project_vertex
  )

  (func (export "project_batch")
    (param $inPtr i32) (param $outPtr i32) (param $count i32)
    (local $i i32) (local $curIn i32) (local $curOut i32)
    (local $x f32) (local $y f32) (local $z f32)

    i32.const 0 local.set $i
    block $break
      loop $loop
        local.get $i local.get $count i32.ge_u br_if $break
        local.get $inPtr local.get $i i32.const 16 i32.mul i32.add local.set $curIn
        local.get $outPtr local.get $i i32.const 24 i32.mul i32.add local.set $curOut

        local.get $curIn f32.load offset=0 local.set $x
        local.get $curIn f32.load offset=4 local.set $y
        local.get $curIn f32.load offset=8 local.set $z

        local.get $x local.get $y local.get $z local.get $curOut local.get $i call $project_vertex
        local.get $i i32.const 1 i32.add local.set $i
        br $loop
      end
    end
  )

  ;; ---------------------------------------------------------------------------
  ;; PAGES 1 & 2: PARTICLE POOL STRUCTURE OF ARRAYS (0x010000 = 65536)
  ;; ---------------------------------------------------------------------------
  (global $P_X i32 (i32.const 65536))
  (global $P_Y i32 (i32.const 69632))
  (global $P_VX i32 (i32.const 73728))
  (global $P_VY i32 (i32.const 77824))
  (global $P_RAD i32 (i32.const 81920))

  (func (export "particle_step")
    (param $count i32) (param $dt f32) (param $gravity f32)
    (param $minX f32) (param $maxX f32) (param $minY f32) (param $maxY f32)
    (local $i i32) (local $ptr i32)
    (local $x f32) (local $y f32) (local $vx f32) (local $vy f32) (local $r f32)

    i32.const 0 local.set $i
    block $break
      loop $loop
        local.get $i local.get $count i32.ge_u br_if $break
        local.get $i i32.const 4 i32.mul local.set $ptr

        global.get $P_X local.get $ptr i32.add f32.load local.set $x
        global.get $P_Y local.get $ptr i32.add f32.load local.set $y
        global.get $P_VX local.get $ptr i32.add f32.load local.set $vx
        global.get $P_VY local.get $ptr i32.add f32.load local.set $vy
        global.get $P_RAD local.get $ptr i32.add f32.load local.set $r

        local.get $vy local.get $gravity local.get $dt f32.mul f32.add local.set $vy
        local.get $x local.get $vx local.get $dt f32.mul f32.add local.set $x
        local.get $y local.get $vy local.get $dt f32.mul f32.add local.set $y

        ;; Bounce Left / Right
        local.get $x local.get $minX local.get $r f32.add f32.lt
        if
          local.get $minX local.get $r f32.add local.set $x
          f32.const 0.0 local.get $vx f32.sub local.set $vx
        else
          local.get $x local.get $maxX local.get $r f32.sub f32.gt
          if
            local.get $maxX local.get $r f32.sub local.set $x
            f32.const 0.0 local.get $vx f32.sub local.set $vx
          end
        end

        ;; Bounce Top / Bottom
        local.get $y local.get $minY local.get $r f32.add f32.lt
        if
          local.get $minY local.get $r f32.add local.set $y
          f32.const 0.0 local.get $vy f32.sub local.set $vy
        else
          local.get $y local.get $maxY local.get $r f32.sub f32.gt
          if
            local.get $maxY local.get $r f32.sub local.set $y
            f32.const 0.0 local.get $vy f32.sub local.set $vy
          end
        end

        global.get $P_X local.get $ptr i32.add local.get $x f32.store
        global.get $P_Y local.get $ptr i32.add local.get $y f32.store
        global.get $P_VX local.get $ptr i32.add local.get $vx f32.store
        global.get $P_VY local.get $ptr i32.add local.get $vy f32.store

        local.get $i i32.const 1 i32.add local.set $i
        br $loop
      end
    end
  )

  ;; ---------------------------------------------------------------------------
  ;; PAGE 3: RIGID BODIES & MICROPHYSICS (0x030000 = 196608)
  ;; Stride: 48 bytes per body
  ;; ---------------------------------------------------------------------------
  (global $RB_BASE i32 (i32.const 196608))

  (func (export "micro_physics_step")
    (param $count i32) (param $dt f32) (param $gravity f32)
    (param $minX f32) (param $maxX f32)
    (local $i i32) (local $ptr i32) (local $flags i32)
    (local $x f32) (local $y f32) (local $vx f32) (local $vy f32)
    (local $bounce f32) (local $friction f32) (local $groundY f32) (local $radius f32)

    i32.const 0 local.set $i
    block $break
      loop $loop
        local.get $i local.get $count i32.ge_u br_if $break
        local.get $i i32.const 48 i32.mul global.get $RB_BASE i32.add local.set $ptr

        ;; flags: bit 0 isStatic, bit 1 isGrounded
        local.get $ptr i32.load offset=36 local.set $flags
        local.get $flags i32.const 1 i32.and
        if
          local.get $i i32.const 1 i32.add local.set $i
          br $loop
        end

        local.get $ptr f32.load offset=0 local.set $x
        local.get $ptr f32.load offset=4 local.set $y
        local.get $ptr f32.load offset=8 local.set $vx
        local.get $ptr f32.load offset=12 local.set $vy
        local.get $ptr f32.load offset=20 local.set $bounce
        local.get $ptr f32.load offset=24 local.set $friction
        local.get $ptr f32.load offset=28 local.set $groundY
        local.get $ptr f32.load offset=32 local.set $radius

        local.get $vy local.get $gravity local.get $dt f32.mul f32.add local.set $vy
        local.get $vx local.get $friction f32.mul local.set $vx
        local.get $x local.get $vx local.get $dt f32.mul f32.add local.set $x
        local.get $y local.get $vy local.get $dt f32.mul f32.add local.set $y

        ;; Ground collision
        local.get $y local.get $radius f32.add local.get $groundY f32.ge
        if
          local.get $groundY local.get $radius f32.sub local.set $y
          f32.const 0.0 local.get $vy f32.sub local.get $bounce f32.mul local.set $vy
          local.get $flags i32.const 2 i32.or local.set $flags
          local.get $vy f32.abs f32.const 18.0 f32.lt
          if
            f32.const 0.0 local.set $vy
          end
        else
          local.get $flags i32.const -3 i32.and local.set $flags
        end

        ;; Left / right walls
        local.get $x local.get $minX local.get $radius f32.add f32.lt
        if
          local.get $minX local.get $radius f32.add local.set $x
          f32.const 0.0 local.get $vx f32.sub local.get $bounce f32.mul local.set $vx
        else
          local.get $x local.get $maxX local.get $radius f32.sub f32.gt
          if
            local.get $maxX local.get $radius f32.sub local.set $x
            f32.const 0.0 local.get $vx f32.sub local.get $bounce f32.mul local.set $vx
          end
        end

        local.get $ptr local.get $x f32.store offset=0
        local.get $ptr local.get $y f32.store offset=4
        local.get $ptr local.get $vx f32.store offset=8
        local.get $ptr local.get $vy f32.store offset=12
        local.get $ptr local.get $flags i32.store offset=36

        local.get $i i32.const 1 i32.add local.set $i
        br $loop
      end
    end
  )

  ;; ---------------------------------------------------------------------------
  ;; PAGE 3: VERLET INTEGRATION (0x034000 = 212992) & CONSTRAINTS (0x037000)
  ;; ---------------------------------------------------------------------------
  (global $VP_BASE i32 (i32.const 212992))
  (global $VC_BASE i32 (i32.const 225280))

  (func (export "verlet_step")
    (param $pCount i32) (param $cCount i32) (param $iterations i32)
    (param $dt f32) (param $gravity f32) (param $drag f32)
    (local $i i32) (local $ptr i32) (local $pinned i32)
    (local $x f32) (local $y f32) (local $px f32) (local $py f32)
    (local $vx f32) (local $vy f32) (local $iter i32)
    (local $cPtr i32) (local $p1Idx i32) (local $p2Idx i32)
    (local $ptr1 i32) (local $ptr2 i32)
    (local $x1 f32) (local $y1 f32) (local $x2 f32) (local $y2 f32)
    (local $dx f32) (local $dy f32) (local $dist f32) (local $diff f32)
    (local $offset f32) (local $stiff f32) (local $tLen f32)

    ;; 1. Position update
    i32.const 0 local.set $i
    block $b1
      loop $l1
        local.get $i local.get $pCount i32.ge_u br_if $b1
        local.get $i i32.const 32 i32.mul global.get $VP_BASE i32.add local.set $ptr

        local.get $ptr i32.load offset=24 local.set $pinned
        local.get $pinned i32.eqz
        if
          local.get $ptr f32.load offset=0 local.set $x
          local.get $ptr f32.load offset=4 local.set $y
          local.get $ptr f32.load offset=8 local.set $px
          local.get $ptr f32.load offset=12 local.set $py

          local.get $x local.get $px f32.sub local.get $drag f32.mul local.set $vx
          local.get $y local.get $py f32.sub local.get $drag f32.mul local.set $vy

          local.get $ptr local.get $x f32.store offset=8
          local.get $ptr local.get $y f32.store offset=12

          local.get $x local.get $vx f32.add local.set $x
          local.get $y local.get $vy f32.add local.get $gravity local.get $dt f32.mul local.get $dt f32.mul f32.add local.set $y

          local.get $ptr local.get $x f32.store offset=0
          local.get $ptr local.get $y f32.store offset=4
        end

        local.get $i i32.const 1 i32.add local.set $i
        br $l1
      end
    end

    ;; 2. Constraint relaxation
    i32.const 0 local.set $iter
    block $b2
      loop $l2
        local.get $iter local.get $iterations i32.ge_u br_if $b2

        i32.const 0 local.set $i
        block $b3
          loop $l3
            local.get $i local.get $cCount i32.ge_u br_if $b3
            local.get $i i32.const 16 i32.mul global.get $VC_BASE i32.add local.set $cPtr

            local.get $cPtr i32.load offset=0 local.set $p1Idx
            local.get $cPtr i32.load offset=4 local.set $p2Idx
            local.get $cPtr f32.load offset=8 local.set $tLen
            local.get $cPtr f32.load offset=12 local.set $stiff

            local.get $p1Idx i32.const 32 i32.mul global.get $VP_BASE i32.add local.set $ptr1
            local.get $p2Idx i32.const 32 i32.mul global.get $VP_BASE i32.add local.set $ptr2

            local.get $ptr1 f32.load offset=0 local.set $x1
            local.get $ptr1 f32.load offset=4 local.set $y1
            local.get $ptr2 f32.load offset=0 local.set $x2
            local.get $ptr2 f32.load offset=4 local.set $y2

            local.get $x2 local.get $x1 f32.sub local.set $dx
            local.get $y2 local.get $y1 f32.sub local.set $dy

            local.get $dx local.get $dx f32.mul local.get $dy local.get $dy f32.mul f32.add f32.sqrt local.set $dist
            local.get $dist f32.const 0.001 f32.max local.set $dist

            local.get $tLen local.get $dist f32.sub local.get $dist f32.div f32.const 0.5 f32.mul local.get $stiff f32.mul local.set $offset

            ;; If p1 not pinned
            local.get $ptr1 i32.load offset=24 i32.eqz
            if
              local.get $ptr1 local.get $x1 local.get $dx local.get $offset f32.mul f32.sub f32.store offset=0
              local.get $ptr1 local.get $y1 local.get $dy local.get $offset f32.mul f32.sub f32.store offset=4
            end

            ;; If p2 not pinned
            local.get $ptr2 i32.load offset=24 i32.eqz
            if
              local.get $ptr2 local.get $x2 local.get $dx local.get $offset f32.mul f32.add f32.store offset=0
              local.get $ptr2 local.get $y2 local.get $dy local.get $offset f32.mul f32.add f32.store offset=4
            end

            local.get $i i32.const 1 i32.add local.set $i
            br $l3
          end
        end

        local.get $iter i32.const 1 i32.add local.set $iter
        br $l2
      end
    end
  )

  ;; ===========================================================================
  ;; EVERYMAN CHASSIS KERNEL (PAGE 0: 0x00000-0x0FFFF, PAGE 6 UPPER: 0x068000)
  ;; Deterministic BIOS-vs-Kernel Fixed-Record Runtime over strict 448 KiB pool
  ;; ===========================================================================
  (global $MAILBOX_BASE i32 (i32.const 0))        ;; 0x00000 (16 B Interrupt Mailbox)
  (global $MCB_BASE i32 (i32.const 16))           ;; 0x00010 (Master Control Block)
  (global $STATE_HEX_PTR i32 (i32.const 136))     ;; 0x00088 (16 B live state register)
  (global $TUPLE_BASE i32 (i32.const 1024))       ;; 0x00400 (64 * 32 B staged tuples)
  (global $MANIFEST_BASE i32 (i32.const 3072))    ;; 0x00C00 (16 B hdr + 96 * 32 B entries)
  (global $VARS_BASE i32 (i32.const 8192))        ;; 0x02000 (128 * 24 B reactive vars)
  (global $HITBOX_BASE i32 (i32.const 11264))     ;; 0x02C00 (32 * 32 B pointer hitboxes)
  (global $STRLUT_BASE i32 (i32.const 12288))     ;; 0x03000 (512 * 8 B string [ptr, len])
  (global $CARTRIDGE_SLOT i32 (i32.const 16384))  ;; 0x04000 (48 KiB loaded .astb slot)
  (global $DISPLAY_LIST i32 (i32.const 425984))   ;; 0x068000 (768 * 32 B display list)
  (global $STR_POOL i32 (i32.const 450560))       ;; 0x06E000 (8 KiB scratch ASCII strings)

  ;; Helper: zero a byte range [ptr, ptr + len)
  (func $mem_zero (param $ptr i32) (param $len i32)
    (local $end i32)
    local.get $ptr local.get $len i32.add local.set $end
    block $done
      loop $clr
        local.get $ptr local.get $end i32.ge_u br_if $done
        local.get $ptr i32.const 0 i32.store8
        local.get $ptr i32.const 1 i32.add local.set $ptr
        br $clr
      end
    end
  )

  ;; Helper: write [ptr, len] pair into String LUT index
  (func $strlut_get_ptr (param $idx i32) (result i32)
    local.get $idx i32.const 512 i32.ge_u
    if (result i32)
      i32.const 0
    else
      global.get $STRLUT_BASE local.get $idx i32.const 8 i32.mul i32.add i32.load align=1
    end
  )

  (func $strlut_get_len (param $idx i32) (result i32)
    local.get $idx i32.const 512 i32.ge_u
    if (result i32)
      i32.const 0
    else
      global.get $STRLUT_BASE local.get $idx i32.const 8 i32.mul i32.add i32.load offset=4 align=1
    end
  )

  ;; Helper: register a tuple slot (max 64) + mirrored 3-column manifest row (max 96)
  (func $register_tuple_and_manifest
    (param $kind i32) (param $stageState i32)
    (param $tagPtr i32) (param $tagLen i32)
    (param $payPtr i32) (param $payLen i32)
    (param $val f32) (param $minV f32) (param $maxV f32) (param $stepV f32)
    (param $payloadRef i32)
    (local $tIdx i32) (local $tPtr i32) (local $mIdx i32) (local $mPtr i32)

    ;; Add Staged Tuple if < 64
    global.get $MCB_BASE i32.load offset=40 align=1 local.set $tIdx
    local.get $tIdx i32.const 64 i32.lt_u
    if
      global.get $TUPLE_BASE local.get $tIdx i32.const 32 i32.mul i32.add local.set $tPtr
      local.get $tPtr local.get $tIdx i32.store16 offset=0 align=1
      local.get $tPtr local.get $stageState i32.store8 offset=2
      local.get $tPtr local.get $kind i32.store8 offset=3
      local.get $tPtr local.get $tagPtr i32.store offset=4 align=1
      local.get $tPtr local.get $tagLen i32.store offset=8 align=1
      local.get $tPtr local.get $payloadRef i32.store offset=12 align=1
      local.get $tPtr local.get $val f32.store offset=16 align=1
      local.get $tPtr local.get $minV f32.store offset=20 align=1
      local.get $tPtr local.get $maxV f32.store offset=24 align=1
      local.get $tPtr local.get $stepV f32.store offset=28 align=1
      global.get $MCB_BASE local.get $tIdx i32.const 1 i32.add i32.store offset=40 align=1
    end

    ;; Add 3-column Manifest entry if < 96
    global.get $MCB_BASE i32.load offset=44 align=1 local.set $mIdx
    local.get $mIdx i32.const 96 i32.lt_u
    if
      global.get $MANIFEST_BASE i32.const 16 i32.add local.get $mIdx i32.const 32 i32.mul i32.add local.set $mPtr
      local.get $mPtr local.get $tIdx i32.store16 offset=0 align=1
      local.get $mPtr local.get $stageState i32.store8 offset=2
      local.get $mPtr local.get $kind i32.store8 offset=3
      local.get $mPtr local.get $tagPtr i32.store offset=4 align=1
      local.get $mPtr local.get $tagLen i32.store offset=8 align=1
      local.get $mPtr local.get $payPtr i32.store offset=12 align=1
      local.get $mPtr local.get $payLen i32.store offset=16 align=1
      local.get $mPtr local.get $val f32.store offset=20 align=1
      local.get $mPtr local.get $minV f32.store offset=24 align=1
      local.get $mPtr local.get $maxV f32.store offset=28 align=1

      global.get $MCB_BASE local.get $mIdx i32.const 1 i32.add i32.store offset=44 align=1
      global.get $MANIFEST_BASE local.get $mIdx i32.const 1 i32.add i32.store offset=0 align=1
    end
  )

  ;; Helper: register a spatial AABB hitbox (max 32)
  (func $register_hitbox
    (param $slotId i32) (param $varIdx i32) (param $axis i32)
    (param $x f32) (param $y f32) (param $w f32) (param $h f32)
    (param $minV f32) (param $maxV f32)
    (local $hIdx i32) (local $hPtr i32)
    global.get $MCB_BASE i32.load offset=52 align=1 local.set $hIdx
    local.get $hIdx i32.const 32 i32.lt_u
    if
      global.get $HITBOX_BASE local.get $hIdx i32.const 32 i32.mul i32.add local.set $hPtr
      local.get $hPtr local.get $slotId i32.store16 offset=0 align=1
      local.get $hPtr local.get $varIdx i32.store16 offset=2 align=1
      local.get $hPtr local.get $x f32.store offset=4 align=1
      local.get $hPtr local.get $y f32.store offset=8 align=1
      local.get $hPtr local.get $w f32.store offset=12 align=1
      local.get $hPtr local.get $h f32.store offset=16 align=1
      local.get $hPtr local.get $minV f32.store offset=20 align=1
      local.get $hPtr local.get $maxV f32.store offset=24 align=1
      local.get $hPtr local.get $axis i32.store offset=28 align=1
      global.get $MCB_BASE local.get $hIdx i32.const 1 i32.add i32.store offset=52 align=1
    end
  )

  ;; Helper: refresh deterministic 16-byte StateHex register at 0x00088
  (func $update_state_hex
    (local $tNorm i32) (local $tick i32) (local $varCnt i32) (local $i i32)
    (local $vPtr i32) (local $vNorm f32) (local $vByte i32) (local $tVal f32)

    ;; t_u16 (bytes 0..1)
    global.get $MCB_BASE f32.load offset=12 align=1 f32.const 65535.0 f32.mul i32.trunc_f32_u
    local.set $tNorm
    global.get $STATE_HEX_PTR local.get $tNorm i32.store16 offset=0 align=1

    ;; tick_u16 (bytes 2..3)
    global.get $MCB_BASE i32.load offset=8 align=1 local.set $tick
    global.get $STATE_HEX_PTR local.get $tick i32.store16 offset=2 align=1

    ;; focused slot + tuple count (bytes 4..5)
    global.get $STATE_HEX_PTR global.get $MCB_BASE i32.load offset=76 align=1 i32.store8 offset=4
    global.get $STATE_HEX_PTR global.get $MCB_BASE i32.load offset=40 align=1 i32.store8 offset=5

    ;; archetype + flags low byte (bytes 6..7)
    global.get $STATE_HEX_PTR global.get $MCB_BASE i32.load offset=24 align=1 i32.store8 offset=6
    global.get $STATE_HEX_PTR global.get $MCB_BASE i32.load offset=28 align=1 i32.store8 offset=7

    ;; first 8 reactive vars mapped to bytes 8..15 (quantized 0..255 against min/max)
    global.get $MCB_BASE i32.load offset=48 align=1 local.set $varCnt
    i32.const 0 local.set $i
    block $endV
      loop $loopV
        local.get $i i32.const 8 i32.ge_u br_if $endV
        local.get $i local.get $varCnt i32.lt_u
        if
          global.get $VARS_BASE local.get $i i32.const 24 i32.mul i32.add local.set $vPtr
          local.get $vPtr f32.load offset=12 align=1 local.set $tVal
          local.get $vPtr f32.load offset=20 align=1 local.get $vPtr f32.load offset=16 align=1 f32.sub
          local.tee $vNorm
          f32.const 0.0001 f32.gt
          if
            local.get $tVal local.get $vPtr f32.load offset=16 align=1 f32.sub local.get $vNorm f32.div
            f32.const 0.0 f32.max f32.const 1.0 f32.min f32.const 255.0 f32.mul i32.trunc_f32_u
            local.set $vByte
          else
            local.get $tVal i32.trunc_f32_s i32.const 255 i32.and local.set $vByte
          end
          global.get $STATE_HEX_PTR local.get $i i32.add local.get $vByte i32.store8 offset=8
        else
          global.get $STATE_HEX_PTR local.get $i i32.add i32.const 0 i32.store8 offset=8
        end
        local.get $i i32.const 1 i32.add local.set $i
        br $loopV
      end
    end
  )

  ;; Helper: swap/drop avoided; emit a 32-byte Display-List command
  (func $emit_dl
    (param $op i32) (param $slotFlags i32)
    (param $x f32) (param $y f32) (param $w f32) (param $h f32)
    (param $rgba i32) (param $strPtr i32)
    (local $cnt i32) (local $ptr i32)
    global.get $MCB_BASE i32.load offset=56 align=1 local.set $cnt
    local.get $cnt i32.const 767 i32.lt_u
    if
      global.get $DISPLAY_LIST local.get $cnt i32.const 32 i32.mul i32.add local.set $ptr
      local.get $ptr local.get $op i32.store offset=0 align=1
      local.get $ptr local.get $slotFlags i32.store offset=4 align=1
      local.get $ptr local.get $x f32.store offset=8 align=1
      local.get $ptr local.get $y f32.store offset=12 align=1
      local.get $ptr local.get $w f32.store offset=16 align=1
      local.get $ptr local.get $h f32.store offset=20 align=1
      local.get $ptr local.get $rgba i32.store offset=24 align=1
      local.get $ptr local.get $strPtr i32.store offset=28 align=1
      global.get $MCB_BASE local.get $cnt i32.const 1 i32.add i32.store offset=56 align=1
    end
  )

  ;; ---------------------------------------------------------------------------
  ;; EXPORTED ABI 1: boot_cartridge(astb_ptr, astb_len) -> status (0=OK)
  ;; Parses .astb header, String Table, & bytecode stream purely inside WASM
  ;; ---------------------------------------------------------------------------
  (func (export "boot_cartridge") (param $astbPtr i32) (param $astbLen i32) (result i32)
    (local $endPtr i32) (local $magic i32) (local $arch i32) (local $deci i32)
    (local $strCount i32) (local $strByteLen i32) (local $flags i32)
    (local $cur i32) (local $i i32) (local $sLen i32) (local $lutPtr i32)
    (local $op i32) (local $sIdx i32) (local $sIdx2 i32) (local $sIdx3 i32)
    (local $cnt i32) (local $vIdx i32) (local $vPtr i32)
    (local $vType i32) (local $val f32) (local $minV f32) (local $maxV f32) (local $stepV f32)
    (local $lblIdx i32) (local $curY f32) (local $tVal f32) (local $boxX f32) (local $boxY f32)
    (local $cpIdx i32)

    ;; Bounds check against 448 KiB (458752) ceiling & minimum 16-byte header
    local.get $astbPtr i32.const 0 i32.lt_s
    local.get $astbLen i32.const 16 i32.lt_u i32.or
    local.get $astbPtr local.get $astbLen i32.add local.tee $endPtr i32.const 458752 i32.gt_u i32.or
    if
      global.get $MCB_BASE i32.const 2 i32.store offset=84 align=1
      i32.const 2 return
    end

    ;; Validate ASTB magic header (0x41 'A', 0x53 'S', 0x54 'T', 0x42 'B')
    local.get $astbPtr i32.load8_u offset=0 i32.const 65 i32.ne
    local.get $astbPtr i32.load8_u offset=1 i32.const 83 i32.ne i32.or
    local.get $astbPtr i32.load8_u offset=2 i32.const 84 i32.ne i32.or
    local.get $astbPtr i32.load8_u offset=3 i32.const 66 i32.ne i32.or
    if
      global.get $MCB_BASE i32.const 1 i32.store offset=84 align=1
      i32.const 1 return
    end

    ;; Clear MCB + Tuple + Manifest + Vars + Hitboxes + String LUT (0x00010..0x03FFF)
    global.get $MCB_BASE i32.const 16368 call $mem_zero

    ;; Initialize MCB Header ("ASTV" = 0x56545341 little endian / 'ASTV')
    global.get $MCB_BASE i32.const 0x56545341 i32.store offset=0 align=1
    global.get $MCB_BASE i32.const 2 i32.store offset=4 align=1        ;; ABI v2
    local.get $astbPtr i32.load8_u offset=5 local.set $arch
    local.get $astbPtr i32.load16_u offset=6 align=1 local.set $deci
    local.get $astbPtr i32.load16_u offset=8 align=1 local.set $strCount
    local.get $astbPtr i32.load offset=10 align=1 local.set $strByteLen
    local.get $astbPtr i32.load16_u offset=14 align=1 local.set $flags

    ;; Ensure String Table fits within astbLen
    i32.const 16 local.get $strByteLen i32.add local.get $astbLen i32.gt_u
    if
      global.get $MCB_BASE i32.const 3 i32.store offset=84 align=1
      i32.const 3 return
    end

    global.get $MCB_BASE local.get $deci f32.convert_i32_u f32.const 10.0 f32.div f32.store offset=20 align=1
    global.get $MCB_BASE local.get $arch i32.store offset=24 align=1
    global.get $MCB_BASE local.get $flags i32.const 0x20000 i32.or i32.store offset=28 align=1 ;; active+playing
    global.get $MCB_BASE f32.const 800.0 f32.store offset=32 align=1
    global.get $MCB_BASE f32.const 480.0 f32.store offset=36 align=1
    global.get $MCB_BASE local.get $astbLen i32.store offset=60 align=1
    global.get $MCB_BASE local.get $strCount i32.store offset=64 align=1
    global.get $MCB_BASE i32.const -1 i32.store offset=76 align=1
    global.get $MCB_BASE i32.const -1 i32.store offset=80 align=1

    ;; Write Manifest Header at 0x00C00
    global.get $MANIFEST_BASE i32.const 32 i32.store offset=4 align=1
    global.get $MANIFEST_BASE global.get $MANIFEST_BASE i32.const 16 i32.add i32.store offset=8 align=1
    global.get $MANIFEST_BASE i32.const 96 i32.store offset=12 align=1

    ;; 1. Index String Table -> 0x03000 (max 512 entries)
    local.get $astbPtr i32.const 16 i32.add local.set $cur
    i32.const 0 local.set $i
    block $strDone
      loop $strLoop
        local.get $i local.get $strCount i32.ge_u br_if $strDone
        local.get $cur i32.const 2 i32.add local.get $astbPtr i32.const 16 i32.add local.get $strByteLen i32.add i32.gt_u br_if $strDone
        local.get $cur i32.load16_u align=1 local.set $sLen
        local.get $cur i32.const 2 i32.add local.set $cur
        local.get $i i32.const 512 i32.lt_u
        if
          global.get $STRLUT_BASE local.get $i i32.const 8 i32.mul i32.add local.set $lutPtr
          local.get $lutPtr local.get $cur i32.store offset=0 align=1
          local.get $lutPtr local.get $sLen i32.store offset=4 align=1
        end
        local.get $cur local.get $sLen i32.add local.set $cur
        local.get $i i32.const 1 i32.add local.set $i
        br $strLoop
      end
    end

    ;; 2. Decode Bytecode Instruction Stream starting at 16 + strByteLen
    local.get $astbPtr i32.const 16 i32.add local.get $strByteLen i32.add local.set $cur
    block $opDone
      loop $opLoop
        local.get $cur local.get $endPtr i32.ge_u br_if $opDone
        local.get $cur i32.load8_u local.set $op
        local.get $cur i32.const 1 i32.add local.set $cur

        ;; 0xFF OP_EOF
        local.get $op i32.const 255 i32.eq br_if $opDone

        ;; 0x01 OP_SCENE_META: id(2) title(2) stage(2) video(2) fit(1)
        local.get $op i32.const 1 i32.eq
        if
          local.get $cur i32.load16_u align=1 local.set $sIdx
          local.get $cur i32.load16_u offset=2 align=1 local.set $sIdx2
          local.get $cur i32.load16_u offset=4 align=1 local.set $sIdx3
          global.get $MCB_BASE local.get $sIdx call $strlut_get_ptr i32.store offset=112 align=1
          global.get $MCB_BASE local.get $sIdx2 call $strlut_get_ptr i32.store offset=116 align=1
          ;; Register Scene root as manifest + docked tuple
          i32.const 6 i32.const 1
          local.get $sIdx call $strlut_get_ptr local.get $sIdx call $strlut_get_len
          local.get $sIdx2 call $strlut_get_ptr local.get $sIdx2 call $strlut_get_len
          global.get $MCB_BASE f32.load offset=20 align=1
          f32.const 0.0 global.get $MCB_BASE f32.load offset=20 align=1 f32.const 0.1
          local.get $sIdx3 call $strlut_get_ptr
          call $register_tuple_and_manifest
          local.get $cur i32.const 9 i32.add local.set $cur
          br $opLoop
        end

        ;; 0x80 OP_CAMERA: yaw_str(2) pitch(4) distance(4) fov(4) = 14 B
        local.get $op i32.const 128 i32.eq
        if
          global.get $MCB_BASE local.get $cur f32.load offset=6 align=1 f32.store offset=88 align=1
          global.get $MCB_BASE local.get $cur f32.load offset=2 align=1 f32.store offset=96 align=1
          global.get $MCB_BASE f32.const 0.0 f32.store offset=92 align=1
          global.get $MCB_BASE local.get $cur f32.load offset=10 align=1 f32.store offset=100 align=1
          local.get $cur i32.const 14 i32.add local.set $cur
          br $opLoop
        end

        ;; 0x81 OP_SVG_COMPANION: svg_str(2) -> store safely after state_hex at MCB+140/144
        local.get $op i32.const 129 i32.eq
        if
          local.get $cur i32.load16_u align=1 local.set $sIdx
          global.get $MCB_BASE local.get $sIdx call $strlut_get_ptr i32.store offset=140 align=1
          global.get $MCB_BASE local.get $sIdx call $strlut_get_len i32.store offset=144 align=1
          local.get $cur i32.const 2 i32.add local.set $cur
          br $opLoop
        end

        ;; 0x82 OP_STYLE_TABLE & 0x83 OP_SHAPE_DEF: length-framed [payload_len: u32] [bytes...]
        local.get $op i32.const 130 i32.eq
        local.get $op i32.const 131 i32.eq
        i32.or
        if
          local.get $cur i32.load align=1 local.set $cnt
          local.get $cur i32.const 4 i32.add local.get $cnt i32.add local.set $cur
          br $opLoop
        end

        ;; 0x84 OP_STAMP: fixed 32-byte display-list stamp (depth:2, sym:2, inst:2, matrix:24, op:1, flags:1)
        local.get $op i32.const 132 i32.eq
        if
          local.get $cur i32.const 32 i32.add local.set $cur
          br $opLoop
        end

        ;; 0x10 OP_KEYFRAME: t_u16(2) title_str(2) rule_str(2)
        local.get $op i32.const 16 i32.eq
        if
          local.get $cur i32.load16_u align=1 f32.convert_i32_u f32.const 65535.0 f32.div local.set $tVal
          local.get $cur i32.load16_u offset=2 align=1 local.set $sIdx
          local.get $cur i32.load16_u offset=4 align=1 local.set $sIdx2
          i32.const 5 i32.const 0
          local.get $sIdx call $strlut_get_ptr local.get $sIdx call $strlut_get_len
          local.get $sIdx2 call $strlut_get_ptr local.get $sIdx2 call $strlut_get_len
          local.get $tVal f32.const 0.0 f32.const 1.0 f32.const 0.01
          local.get $cur
          call $register_tuple_and_manifest
          global.get $MCB_BASE global.get $MCB_BASE i32.load offset=72 align=1 i32.const 1 i32.add i32.store offset=72 align=1
          local.get $cur i32.const 6 i32.add local.set $cur
          br $opLoop
        end

        ;; 0x20 OP_SUBTITLE: start(2) end(2) lang_count(1) + lang_count * 4
        local.get $op i32.const 32 i32.eq
        if
          local.get $cur i32.load8_u offset=4 local.set $cnt
          local.get $cur i32.const 5 i32.add local.get $cnt i32.const 4 i32.mul i32.add local.set $cur
          br $opLoop
        end

        ;; 0x30 OP_BINDING: target(2) attr(2) expr(2)
        local.get $op i32.const 48 i32.eq
        if
          local.get $cur i32.const 6 i32.add local.set $cur
          br $opLoop
        end

        ;; 0x31 OP_BINDING_WHEN: target(2) attr(2) expr(2) when(2)
        local.get $op i32.const 49 i32.eq
        if
          local.get $cur i32.const 8 i32.add local.set $cur
          br $opLoop
        end

        ;; 0x32 OP_BINDING_VAR: var(2) expr(2) when(2)
        local.get $op i32.const 50 i32.eq
        if
          local.get $cur i32.const 6 i32.add local.set $cur
          br $opLoop
        end

        ;; 0x33 OP_3D_LINE: 13*u16(26) + baseR(4) + splineIndex(2) + flags(1) = 33 B (+4 if flags&2, +4 if flags&4)
        local.get $op i32.const 51 i32.eq
        if
          local.get $cur i32.load8_u offset=32 local.set $cnt
          local.get $cur i32.const 33 i32.add local.set $cur
          local.get $cnt i32.const 2 i32.and
          if
            local.get $cur i32.const 4 i32.add local.set $cur
          end
          local.get $cnt i32.const 4 i32.and
          if
            local.get $cur i32.const 4 i32.add local.set $cur
          end
          br $opLoop
        end

        ;; 0x34 OP_3D_NODE: 6*u16(12) + baseR(4) + flags(1) = 17 B (+4 if flags&2, +4 if flags&4)
        local.get $op i32.const 52 i32.eq
        if
          local.get $cur i32.load8_u offset=16 local.set $cnt
          local.get $cur i32.const 17 i32.add local.set $cur
          local.get $cnt i32.const 2 i32.and
          if
            local.get $cur i32.const 4 i32.add local.set $cur
          end
          local.get $cnt i32.const 4 i32.and
          if
            local.get $cur i32.const 4 i32.add local.set $cur
          end
          br $opLoop
        end

        ;; 0x35 OP_3D_RING: 9*u16(18) + segments(2) + flags(1) = 21 B (+4 if flags&2, +4 if flags&4)
        local.get $op i32.const 53 i32.eq
        if
          local.get $cur i32.load8_u offset=20 local.set $cnt
          local.get $cur i32.const 21 i32.add local.set $cur
          local.get $cnt i32.const 2 i32.and
          if
            local.get $cur i32.const 4 i32.add local.set $cur
          end
          local.get $cnt i32.const 4 i32.and
          if
            local.get $cur i32.const 4 i32.add local.set $cur
          end
          br $opLoop
        end

        ;; 0x40 OP_CHECKPOINT: t(2) prompt(2) ans(1) expl(2) opt_count(1) + opt_count * 2
        local.get $op i32.const 64 i32.eq
        if
          local.get $cur i32.load16_u align=1 f32.convert_i32_u f32.const 65535.0 f32.div local.set $tVal
          local.get $cur i32.load16_u offset=2 align=1 local.set $sIdx
          local.get $cur i32.load16_u offset=5 align=1 local.set $sIdx2
          local.get $cur i32.load8_u offset=7 local.set $cnt
          i32.const 4 i32.const 0
          local.get $sIdx call $strlut_get_ptr local.get $sIdx call $strlut_get_len
          local.get $sIdx2 call $strlut_get_ptr local.get $sIdx2 call $strlut_get_len
          local.get $tVal f32.const 0.0 f32.const 1.0 f32.const 0.01
          local.get $cur
          call $register_tuple_and_manifest
          global.get $MCB_BASE global.get $MCB_BASE i32.load offset=68 align=1 i32.const 1 i32.add i32.store offset=68 align=1
          local.get $cur i32.const 8 i32.add local.get $cnt i32.const 2 i32.mul i32.add local.set $cur
          br $opLoop
        end

        ;; 0x41 OP_CHECKPOINT_GOAL: cp_idx(2) title(2) pass(2) hold(4) wrong_cnt(1) + wrong_cnt * 3
        local.get $op i32.const 65 i32.eq
        if
          local.get $cur i32.load8_u offset=10 local.set $cnt
          local.get $cur i32.const 11 i32.add local.get $cnt i32.const 3 i32.mul i32.add local.set $cur
          br $opLoop
        end

        ;; 0x50 OP_GESTURE: target(2) axis(1) min(4) max(4)
        local.get $op i32.const 80 i32.eq
        if
          local.get $cur i32.load16_u align=1 local.set $sIdx
          local.get $cur i32.load8_u offset=2 local.set $vType
          local.get $cur f32.load offset=3 align=1 local.set $minV
          local.get $cur f32.load offset=7 align=1 local.set $maxV
          global.get $MCB_BASE i32.load offset=40 align=1 local.set $cpIdx
          i32.const 3 i32.const 1
          local.get $sIdx call $strlut_get_ptr local.get $sIdx call $strlut_get_len
          local.get $sIdx call $strlut_get_ptr local.get $sIdx call $strlut_get_len
          local.get $minV local.get $minV local.get $maxV f32.const 1.0
          local.get $cur
          call $register_tuple_and_manifest
          ;; Add interactive stage hitbox in lower band for Everyman Canvas
          local.get $cpIdx i32.const 65535 local.get $vType
          f32.const 420.0 f32.const 40.0
          global.get $MCB_BASE i32.load offset=52 align=1 f32.convert_i32_u f32.const 38.0 f32.mul f32.add
          f32.const 340.0 f32.const 30.0
          local.get $minV local.get $maxV
          call $register_hitbox
          local.get $cur i32.const 11 i32.add local.set $cur
          br $opLoop
        end

        ;; 0x60 OP_VAR: name(2) type(1) val(4) min(4) max(4) step(4) label(2)
        local.get $op i32.const 96 i32.eq
        if
          local.get $cur i32.load16_u align=1 local.set $sIdx
          local.get $cur i32.load8_u offset=2 local.set $vType
          local.get $cur f32.load offset=3 align=1 local.set $val
          local.get $cur f32.load offset=7 align=1 local.set $minV
          local.get $cur f32.load offset=11 align=1 local.set $maxV
          local.get $cur f32.load offset=15 align=1 local.set $stepV
          local.get $cur i32.load16_u offset=19 align=1 local.set $lblIdx

          global.get $MCB_BASE i32.load offset=48 align=1 local.set $vIdx
          local.get $vIdx i32.const 128 i32.lt_u
          if
            global.get $VARS_BASE local.get $vIdx i32.const 24 i32.mul i32.add local.set $vPtr
            global.get $MCB_BASE i32.load offset=40 align=1 local.set $cpIdx
            local.get $vPtr local.get $sIdx call $strlut_get_ptr i32.store offset=0 align=1
            local.get $vPtr local.get $sIdx call $strlut_get_len i32.store offset=4 align=1
            local.get $vPtr local.get $vType i32.store8 offset=8
            local.get $vPtr i32.const 0 i32.store8 offset=9
            local.get $vPtr local.get $cpIdx i32.store16 offset=10 align=1
            local.get $vPtr local.get $val f32.store offset=12 align=1
            local.get $vPtr local.get $minV f32.store offset=16 align=1
            local.get $vPtr local.get $maxV f32.store offset=20 align=1
            global.get $MCB_BASE local.get $vIdx i32.const 1 i32.add i32.store offset=48 align=1

            i32.const 1 i32.const 1
            local.get $sIdx call $strlut_get_ptr local.get $sIdx call $strlut_get_len
            local.get $lblIdx call $strlut_get_ptr local.get $lblIdx call $strlut_get_len
            local.get $val local.get $minV local.get $maxV local.get $stepV
            local.get $vPtr
            call $register_tuple_and_manifest

            ;; Map slider bar hitbox in left deck (max 8 visible slider hitboxes cleanly stacked)
            local.get $vIdx i32.const 8 i32.lt_u
            if
              f32.const 32.0 local.set $boxX
              f32.const 92.0 local.get $vIdx f32.convert_i32_u f32.const 44.0 f32.mul f32.add local.set $boxY
              local.get $cpIdx local.get $vIdx i32.const 1
              local.get $boxX local.get $boxY f32.const 320.0 f32.const 34.0
              local.get $minV local.get $maxV
              call $register_hitbox
            end
          end
          local.get $cur i32.const 21 i32.add local.set $cur
          br $opLoop
        end

        ;; 0x70 OP_INPUT: kind(1) var(2) label(2) min(4) max(4) step(4)
        local.get $op i32.const 112 i32.eq
        if
          local.get $cur i32.load16_u offset=1 align=1 local.set $sIdx
          local.get $cur i32.load16_u offset=3 align=1 local.set $lblIdx
          local.get $cur f32.load offset=5 align=1 local.set $minV
          local.get $cur f32.load offset=9 align=1 local.set $maxV
          local.get $cur f32.load offset=13 align=1 local.set $stepV
          i32.const 2 i32.const 1
          local.get $sIdx call $strlut_get_ptr local.get $sIdx call $strlut_get_len
          local.get $lblIdx call $strlut_get_ptr local.get $lblIdx call $strlut_get_len
          local.get $minV local.get $minV local.get $maxV local.get $stepV
          local.get $cur
          call $register_tuple_and_manifest
          local.get $cur i32.const 17 i32.add local.set $cur
          br $opLoop
        end

        ;; 0x90 OP_SCOPE: 40 B fixed
        local.get $op i32.const 144 i32.eq
        if
          local.get $cur i32.const 40 i32.add local.set $cur
          br $opLoop
        end

        ;; 0x91 OP_LEDGER: 25 B + term_count(byte +24) * 6
        local.get $op i32.const 145 i32.eq
        if
          local.get $cur i32.load8_u offset=24 local.set $cnt
          local.get $cur i32.const 25 i32.add local.get $cnt i32.const 6 i32.mul i32.add local.set $cur
          br $opLoop
        end

        ;; 0x61 OP_COMPUTED: name(2) expr(2)
        local.get $op i32.const 97 i32.eq
        if
          local.get $cur i32.const 4 i32.add local.set $cur
          br $opLoop
        end

        ;; 0xA0 OP_SCENE_EXT: key(2) payload(2)
        local.get $op i32.const 160 i32.eq
        if
          local.get $cur i32.const 4 i32.add local.set $cur
          br $opLoop
        end

        ;; Unknown opcode: abort scan cleanly
        br $opDone
      end
    end

    call $update_state_hex
    i32.const 0
  )

  ;; ---------------------------------------------------------------------------
  ;; EXPORTED ABI 2: dispatch_tuple(slot_id, op, arg1, arg2) -> status (0=OK)
  ;; Unified control plane for Pointer, Keyboard, and Gemini Nano / WebMCP
  ;; op: 1=focus, 2=dock, 3=offstage, 4=set_val, 5=reset, 6=toggle_play, 7=set_t
  ;; ---------------------------------------------------------------------------
  (func (export "dispatch_tuple") (param $slotId i32) (param $op i32) (param $arg1 f32) (param $arg2 f32) (result i32)
    (local $tCnt i32) (local $tPtr i32) (local $mPtr i32) (local $vPtr i32)
    (local $minV f32) (local $maxV f32) (local $clamped f32) (local $flags i32)
    (local $seq i32)

    ;; Mirror command into 16-byte Interrupt Mailbox at 0x00000
    global.get $MAILBOX_BASE local.get $slotId i32.store16 offset=0 align=1
    global.get $MAILBOX_BASE i32.const 3 i32.store8 offset=2
    global.get $MAILBOX_BASE local.get $op i32.store8 offset=3
    global.get $MAILBOX_BASE local.get $arg1 f32.store offset=4 align=1
    global.get $MAILBOX_BASE local.get $arg2 f32.store offset=8 align=1
    global.get $MAILBOX_BASE i32.load offset=12 align=1 i32.const 1 i32.add local.set $seq
    global.get $MAILBOX_BASE local.get $seq i32.store offset=12 align=1

    ;; Global op 5: reset clock
    local.get $op i32.const 5 i32.eq
    if
      global.get $MCB_BASE f32.const 0.0 f32.store offset=12 align=1
      global.get $MCB_BASE f32.const 0.0 f32.store offset=16 align=1
      call $update_state_hex
      i32.const 0 return
    end

    ;; Global op 6: toggle play/pause (bit 0x20000 in MCB flags)
    local.get $op i32.const 6 i32.eq
    if
      global.get $MCB_BASE i32.load offset=28 align=1 i32.const 0x20000 i32.xor local.set $flags
      global.get $MCB_BASE local.get $flags i32.store offset=28 align=1
      call $update_state_hex
      i32.const 0 return
    end

    ;; Global op 7: set normalized time t
    local.get $op i32.const 7 i32.eq
    if
      local.get $arg1 f32.const 0.0 f32.max f32.const 1.0 f32.min local.set $clamped
      global.get $MCB_BASE local.get $clamped f32.store offset=12 align=1
      global.get $MCB_BASE local.get $clamped global.get $MCB_BASE f32.load offset=20 align=1 f32.mul f32.store offset=16 align=1
      call $update_state_hex
      i32.const 0 return
    end

    ;; Per-slot tuple mutation
    global.get $MCB_BASE i32.load offset=40 align=1 local.set $tCnt
    local.get $slotId i32.const 0 i32.lt_s
    local.get $slotId local.get $tCnt i32.ge_u i32.or
    if
      i32.const 2 return
    end

    global.get $TUPLE_BASE local.get $slotId i32.const 32 i32.mul i32.add local.set $tPtr
    global.get $MANIFEST_BASE i32.const 16 i32.add local.get $slotId i32.const 32 i32.mul i32.add local.set $mPtr

    ;; Stage state updates (1=focus -> state 2, 2=dock -> state 1, 3=offstage -> state 0)
    local.get $op i32.const 1 i32.eq
    if
      local.get $tPtr i32.const 2 i32.store8 offset=2
      local.get $mPtr i32.const 2 i32.store8 offset=2
      global.get $MCB_BASE local.get $slotId i32.store offset=76 align=1
    end
    local.get $op i32.const 2 i32.eq
    if
      local.get $tPtr i32.const 1 i32.store8 offset=2
      local.get $mPtr i32.const 1 i32.store8 offset=2
    end
    local.get $op i32.const 3 i32.eq
    if
      local.get $tPtr i32.const 0 i32.store8 offset=2
      local.get $mPtr i32.const 0 i32.store8 offset=2
    end

    ;; op 4: set tuple numeric value (and linked reactive var if kind==1)
    local.get $op i32.const 4 i32.eq
    if
      local.get $tPtr f32.load offset=20 align=1 local.set $minV
      local.get $tPtr f32.load offset=24 align=1 local.set $maxV
      local.get $maxV local.get $minV f32.gt
      if (result f32)
        local.get $arg1 local.get $minV f32.max local.get $maxV f32.min
      else
        local.get $arg1
      end
      local.set $clamped
      local.get $tPtr local.get $clamped f32.store offset=16 align=1
      local.get $mPtr local.get $clamped f32.store offset=20 align=1

      local.get $tPtr i32.load8_u offset=3 i32.const 1 i32.eq
      if
        local.get $tPtr i32.load offset=12 align=1 local.tee $vPtr
        i32.const 8192 i32.ge_u
        if
          local.get $vPtr local.get $clamped f32.store offset=12 align=1
          local.get $vPtr i32.const 1 i32.store8 offset=9
        end
      end
    end

    call $update_state_hex
    i32.const 0
  )

  ;; ---------------------------------------------------------------------------
  ;; EXPORTED ABI 3: pointer_event(phase, x, y, buttons) -> hit_slot_id (-1 none)
  ;; phase: 0=move, 1=down, 2=up
  ;; ---------------------------------------------------------------------------
  (func (export "pointer_event") (param $phase i32) (param $x f32) (param $y f32) (param $buttons i32) (result i32)
    (local $hCnt i32) (local $i i32) (local $hPtr i32)
    (local $bx f32) (local $by f32) (local $bw f32) (local $bh f32)
    (local $slotId i32) (local $frac f32) (local $minV f32) (local $maxV f32) (local $newVal f32)

    ;; Record in MCB & 16-B Mailbox
    global.get $MCB_BASE local.get $x f32.store offset=104 align=1
    global.get $MCB_BASE local.get $y f32.store offset=108 align=1
    global.get $MCB_BASE local.get $buttons i32.store offset=112 align=1
    global.get $MCB_BASE i32.const -1 i32.store offset=80 align=1

    global.get $MAILBOX_BASE i32.const 1 i32.store8 offset=2
    global.get $MAILBOX_BASE local.get $phase i32.store8 offset=3
    global.get $MAILBOX_BASE local.get $x f32.store offset=4 align=1
    global.get $MAILBOX_BASE local.get $y f32.store offset=8 align=1

    global.get $MCB_BASE i32.load offset=52 align=1 local.set $hCnt
    i32.const 0 local.set $i
    block $done
      loop $hitLoop
        local.get $i local.get $hCnt i32.ge_u br_if $done
        global.get $HITBOX_BASE local.get $i i32.const 32 i32.mul i32.add local.set $hPtr
        local.get $hPtr f32.load offset=4 align=1 local.set $bx
        local.get $hPtr f32.load offset=8 align=1 local.set $by
        local.get $hPtr f32.load offset=12 align=1 local.set $bw
        local.get $hPtr f32.load offset=16 align=1 local.set $bh

        local.get $x local.get $bx f32.ge
        local.get $x local.get $bx local.get $bw f32.add f32.le i32.and
        local.get $y local.get $by f32.ge i32.and
        local.get $y local.get $by local.get $bh f32.add f32.le i32.and
        if
          local.get $hPtr i32.load16_u offset=0 align=1 local.set $slotId
          global.get $MCB_BASE local.get $slotId i32.store offset=80 align=1
          ;; On click or drag with button held, scrub slider value in WASM!
          local.get $phase i32.const 1 i32.eq
          local.get $buttons i32.const 0 i32.gt_s i32.or
          if
            local.get $x local.get $bx f32.sub local.get $bw f32.const 1.0 f32.max f32.div
            f32.const 0.0 f32.max f32.const 1.0 f32.min local.set $frac
            local.get $hPtr f32.load offset=20 align=1 local.set $minV
            local.get $hPtr f32.load offset=24 align=1 local.set $maxV
            local.get $minV local.get $maxV local.get $minV f32.sub local.get $frac f32.mul f32.add local.set $newVal
            local.get $slotId i32.const 1 f32.const 0.0 f32.const 0.0 call $dispatch_tuple_internal
            local.get $slotId i32.const 4 local.get $newVal f32.const 0.0 call $dispatch_tuple_internal
          end
          local.get $slotId return
        end
        local.get $i i32.const 1 i32.add local.set $i
        br $hitLoop
      end
    end
    i32.const -1
  )

  (func $dispatch_tuple_internal (param $s i32) (param $op i32) (param $a1 f32) (param $a2 f32)
    (local $tPtr i32) (local $mPtr i32) (local $vPtr i32) (local $tCnt i32)
    global.get $MCB_BASE i32.load offset=40 align=1 local.set $tCnt
    local.get $s local.get $tCnt i32.ge_u
    if return end
    global.get $TUPLE_BASE local.get $s i32.const 32 i32.mul i32.add local.set $tPtr
    global.get $MANIFEST_BASE i32.const 16 i32.add local.get $s i32.const 32 i32.mul i32.add local.set $mPtr
    local.get $op i32.const 1 i32.eq
    if
      local.get $tPtr i32.const 2 i32.store8 offset=2
      local.get $mPtr i32.const 2 i32.store8 offset=2
      global.get $MCB_BASE local.get $s i32.store offset=76 align=1
    else
      local.get $tPtr local.get $a1 f32.store offset=16 align=1
      local.get $mPtr local.get $a1 f32.store offset=20 align=1
      local.get $tPtr i32.load8_u offset=3 i32.const 1 i32.eq
      if
        local.get $tPtr i32.load offset=12 align=1 local.tee $vPtr
        i32.const 8192 i32.ge_u
        if
          local.get $vPtr local.get $a1 f32.store offset=12 align=1
        end
      end
      call $update_state_hex
    end
  )

  ;; ---------------------------------------------------------------------------
  ;; EXPORTED ABI 4: key_event(phase, key_code, mods) -> 0
  ;; Spacebar (32) toggles play, Home (36) resets timeline, Left/Right steps t
  ;; ---------------------------------------------------------------------------
  (func (export "key_event") (param $phase i32) (param $keyCode i32) (param $mods i32) (result i32)
    (local $flags i32) (local $t f32)
    global.get $MAILBOX_BASE i32.const 2 i32.store8 offset=2
    global.get $MAILBOX_BASE local.get $phase i32.store8 offset=3
    global.get $MAILBOX_BASE local.get $keyCode i32.store offset=12 align=1

    local.get $phase i32.const 1 i32.eq
    if
      local.get $keyCode i32.const 32 i32.eq
      if
        global.get $MCB_BASE i32.load offset=28 align=1 i32.const 0x20000 i32.xor local.set $flags
        global.get $MCB_BASE local.get $flags i32.store offset=28 align=1
      end
      local.get $keyCode i32.const 36 i32.eq
      if
        global.get $MCB_BASE f32.const 0.0 f32.store offset=12 align=1
        global.get $MCB_BASE f32.const 0.0 f32.store offset=16 align=1
      end
      local.get $keyCode i32.const 39 i32.eq
      if
        global.get $MCB_BASE f32.load offset=12 align=1 f32.const 0.05 f32.add f32.const 1.0 f32.min local.set $t
        global.get $MCB_BASE local.get $t f32.store offset=12 align=1
      end
      local.get $keyCode i32.const 37 i32.eq
      if
        global.get $MCB_BASE f32.load offset=12 align=1 f32.const 0.05 f32.sub f32.const 0.0 f32.max local.set $t
        global.get $MCB_BASE local.get $t f32.store offset=12 align=1
      end
      call $update_state_hex
    end
    i32.const 0
  )

  ;; ---------------------------------------------------------------------------
  ;; EXPORTED ABI 5: tick(dt_ms) -> display_list_cmd_count
  ;; Advances deterministic timeline, refreshes state_hex, emits 32 B Draw List
  ;; ---------------------------------------------------------------------------
  (func (export "tick") (param $dtMs f32) (result i32)
    (local $tick i32) (local $dtSec f32) (local $dur f32) (local $elap f32) (local $t f32)
    (local $flags i32) (local $i i32) (local $tCnt i32) (local $tPtr i32)
    (local $vPtr i32) (local $vIdx i32) (local $vCnt i32) (local $hCnt i32) (local $hPtr i32)
    (local $bx f32) (local $by f32) (local $bw f32) (local $bh f32)
    (local $val f32) (local $minV f32) (local $maxV f32) (local $ratio f32)
    (local $slotId i32) (local $lblPtr i32) (local $lblLen i32) (local $col i32)

    ;; 1. Increment Tick Index
    global.get $MCB_BASE i32.load offset=8 align=1 i32.const 1 i32.add local.set $tick
    global.get $MCB_BASE local.get $tick i32.store offset=8 align=1

    ;; 2. Advance Clock if Playing (bit 0x20000)
    local.get $dtMs f32.const 1000.0 f32.div f32.const 0.0 f32.max f32.const 0.1 f32.min local.set $dtSec
    global.get $MCB_BASE i32.load offset=28 align=1 local.set $flags
    local.get $flags i32.const 0x20000 i32.and
    if
      global.get $MCB_BASE f32.load offset=20 align=1 f32.const 1.0 f32.max local.set $dur
      global.get $MCB_BASE f32.load offset=16 align=1 local.get $dtSec f32.add local.set $elap
      local.get $elap local.get $dur f32.gt
      if
        local.get $elap local.get $dur f32.sub local.set $elap
      end
      local.get $elap local.get $dur f32.div f32.const 0.0 f32.max f32.const 1.0 f32.min local.set $t
      global.get $MCB_BASE local.get $elap f32.store offset=16 align=1
      global.get $MCB_BASE local.get $t f32.store offset=12 align=1
    else
      global.get $MCB_BASE f32.load offset=12 align=1 local.set $t
    end

    call $update_state_hex

    ;; 3. Emit Flat 32-Byte Display List into 0x068000 (Upper Page 6)
    global.get $MCB_BASE i32.const 0 i32.store offset=56 align=1

    ;; CMD 1: CLEAR_RECT (opcode=1, #0f172a -> RGBA 0x0F172AFF)
    i32.const 1 i32.const 0
    f32.const 0.0 f32.const 0.0 f32.const 800.0 f32.const 480.0
    i32.const 0x0F172AFF i32.const 0
    call $emit_dl

    ;; CMD 2: Top Header Bar Rect (opcode=2, #1e293b)
    i32.const 2 i32.const 0
    f32.const 16.0 f32.const 16.0 f32.const 768.0 f32.const 44.0
    i32.const 0x1E293BFF i32.const 0
    call $emit_dl

    ;; CMD 3: Scene Title Text (opcode=5) -> MCB offset=116 holds title UTF-8 ptr; manifest row 0 payload holds title
    global.get $MCB_BASE i32.load offset=116 align=1 local.tee $lblPtr
    if
      global.get $MANIFEST_BASE i32.load offset=32 align=1 local.set $lblLen
      i32.const 5
      local.get $lblLen i32.const 16 i32.shl
      f32.const 32.0 f32.const 44.0 f32.const 16.0 f32.const 700.0
      i32.const 0xF8FAFCFF local.get $lblPtr
      call $emit_dl
    end

    ;; CMD 4: Interactive Var Sliders & Progress Gauges from Hitbox Table
    global.get $MCB_BASE i32.load offset=52 align=1 local.set $hCnt
    i32.const 0 local.set $i
    block $dlDone
      loop $dlLoop
        local.get $i local.get $hCnt i32.ge_u br_if $dlDone
        global.get $HITBOX_BASE local.get $i i32.const 32 i32.mul i32.add local.set $hPtr
        local.get $hPtr i32.load16_u offset=0 align=1 local.set $slotId
        local.get $hPtr f32.load offset=4 align=1 local.set $bx
        local.get $hPtr f32.load offset=8 align=1 local.set $by
        local.get $hPtr f32.load offset=12 align=1 local.set $bw
        local.get $hPtr f32.load offset=16 align=1 local.set $bh

        global.get $TUPLE_BASE local.get $slotId i32.const 32 i32.mul i32.add local.set $tPtr
        local.get $tPtr f32.load offset=16 align=1 local.set $val
        local.get $tPtr f32.load offset=20 align=1 local.set $minV
        local.get $tPtr f32.load offset=24 align=1 local.set $maxV

        local.get $maxV local.get $minV f32.sub f32.const 0.0001 f32.max local.set $ratio
        local.get $val local.get $minV f32.sub local.get $ratio f32.div f32.const 0.0 f32.max f32.const 1.0 f32.min local.set $ratio

        ;; Box background
        i32.const 2 local.get $slotId
        local.get $bx local.get $by local.get $bw local.get $bh
        global.get $MCB_BASE i32.load offset=76 align=1 local.get $slotId i32.eq
        if (result i32) i32.const 0x1D4ED8FF else i32.const 0x1E293BFF end
        i32.const 0
        call $emit_dl

        ;; Active fill bar
        i32.const 2 local.get $slotId
        local.get $bx local.get $by local.get $bw local.get $ratio f32.mul local.get $bh
        i32.const 0x0EA5E9AA i32.const 0
        call $emit_dl

        ;; Label from Tuple Tag
        local.get $tPtr i32.load offset=4 align=1 local.set $lblPtr
        local.get $tPtr i32.load offset=8 align=1 local.set $lblLen
        i32.const 5
        local.get $lblLen i32.const 16 i32.shl local.get $slotId i32.or
        local.get $bx f32.const 10.0 f32.add
        local.get $by f32.const 21.0 f32.add
        f32.const 13.0 f32.const 0.0
        i32.const 0xF1F5F9FF local.get $lblPtr
        call $emit_dl

        local.get $i i32.const 1 i32.add local.set $i
        br $dlLoop
      end
    end

    ;; CMD 5: Bottom Timeline Progress Scrubber Track & Thumb
    i32.const 2 i32.const 0
    f32.const 32.0 f32.const 444.0 f32.const 736.0 f32.const 12.0
    i32.const 0x334155FF i32.const 0
    call $emit_dl

    i32.const 2 i32.const 0
    f32.const 32.0 f32.const 444.0 f32.const 736.0 local.get $t f32.mul f32.const 12.0
    i32.const 0x38BDF8FF i32.const 0
    call $emit_dl

    ;; Pulsing Center Orbital Indicator (pure kinetic geometry computed in WASM)
    i32.const 4 i32.const 0
    f32.const 580.0 local.get $t f32.const 1.5 f32.mul f32.const 0.5 f32.sub f32.const 120.0 f32.mul f32.add
    f32.const 240.0
    f32.const 22.0
    f32.const 22.0
    i32.const 0x38BDF8FF i32.const 0
    call $emit_dl

    ;; END_FRAME terminator (opcode=0)
    i32.const 0 i32.const 0 f32.const 0.0 f32.const 0.0 f32.const 0.0 f32.const 0.0 i32.const 0 i32.const 0
    call $emit_dl

    global.get $MCB_BASE i32.load offset=56 align=1
  )

  ;; ---------------------------------------------------------------------------
  ;; EXPORTED ABI 6..8: Zero-Copy Base Pointer Accessors
  ;; ---------------------------------------------------------------------------
  (func (export "get_manifest_ptr") (result i32)
    global.get $MANIFEST_BASE
  )

  (func (export "get_display_list_ptr") (result i32)
    global.get $DISPLAY_LIST
  )

  (func (export "get_state_hex_ptr") (result i32)
    global.get $STATE_HEX_PTR
  )

  (func (export "get_cartridge_slot_ptr") (result i32)
    global.get $CARTRIDGE_SLOT
  )
)
