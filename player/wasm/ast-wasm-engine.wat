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
)
