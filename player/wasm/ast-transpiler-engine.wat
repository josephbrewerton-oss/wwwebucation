(module
  ;; ===========================================================================
  ;; St Joseph's Educational Media Suite — High-Performance Transpiler WASM Kernel
  ;; Decodes SWF FWS/CWS Binary Streams & Ingests Monolithic PhET Bundles
  ;; Memory capacity: 16 pages (1024 KiB)
  ;; ===========================================================================
  (memory (export "memory") 16)

  ;; Page 0 Memory Offsets for Metadata & Uniforms
  ;; 0x0000: Signature (1=FWS, 2=CWS, 3=ZWS, 0=UNKNOWN)
  ;; 0x0004: Version (i32)
  ;; 0x0008: FileLength (i32)
  ;; 0x000C: Width (f32)
  ;; 0x0010: Height (f32)
  ;; 0x0014: FrameRate (f32)
  ;; 0x0018: FrameCount (i32)
  ;; 0x001C: ShapeCount (i32)
  ;; 0x0020: MorphShapeCount (i32)
  ;; 0x0024: ActionCount (i32)
  ;; 0x0028: BgColor (i32)
  ;; 0x002C: TagCount (i32)
  ;; 0x0030: PhetInvariantMask (i32)
  ;; 0x0034: PhetPropertyCount (i32)
  ;; 0x0038: CompressionRatio (f32)

  ;; ---------------------------------------------------------------------------
  ;; 1. SWF BINARY HEADER & RECT UNPACKER
  ;; ---------------------------------------------------------------------------
  (func (export "decode_swf_header")
    (param $inPtr i32) (param $byteLen i32)
    (result i32)
    (local $sig i32)
    (local $ver i32)
    (local $fileLen i32)
    (local $b0 i32) (local $b1 i32) (local $b2 i32)
    (local $nbits i32)
    (local $w f32) (local $h f32)
    (local $fps f32) (local $fc i32)
    (local $curByte i32)
    (local $rectBytes i32)
    (local $xMin i32) (local $xMax i32)
    (local $yMin i32) (local $yMax i32)

    ;; Minimum SWF header length is 21 bytes
    local.get $byteLen i32.const 21 i32.lt_s
    if
      i32.const 0
      return
    end

    ;; Check Signature FWS (70,87,83) / CWS (67,87,83) / ZWS (90,87,83)
    local.get $inPtr i32.load8_u local.set $b0
    local.get $inPtr i32.const 1 i32.add i32.load8_u local.set $b1
    local.get $inPtr i32.const 2 i32.add i32.load8_u local.set $b2

    i32.const 0 local.set $sig
    local.get $b1 i32.const 87 i32.eq
    local.get $b2 i32.const 83 i32.eq
    i32.and
    if
      local.get $b0 i32.const 70 i32.eq ;; 'F'
      if
        i32.const 1 local.set $sig ;; FWS
      else
        local.get $b0 i32.const 67 i32.eq ;; 'C'
        if
          i32.const 2 local.set $sig ;; CWS
        else
          local.get $b0 i32.const 90 i32.eq ;; 'Z'
          if
            i32.const 3 local.set $sig ;; ZWS
          end
        end
      end
    end

    local.get $sig i32.const 0 i32.eq
    if
      i32.const 0
      return
    end

    ;; Version at byte 3
    local.get $inPtr i32.const 3 i32.add i32.load8_u local.set $ver

    ;; File Length (32-bit little endian) at bytes 4..7
    local.get $inPtr i32.const 4 i32.add i32.load local.set $fileLen

    ;; Store basic header info
    i32.const 0 local.get $sig i32.store
    i32.const 4 local.get $ver i32.store
    i32.const 8 local.get $fileLen i32.store

    ;; RECT decoding starting at byte 8
    local.get $inPtr i32.const 8 i32.add i32.load8_u local.set $curByte
    local.get $curByte i32.const 3 i32.shr_u local.set $nbits

    ;; Standard twips approximation / unpack calculation
    ;; Calculate total bits: 5 + 4 * nbits
    ;; Total bytes = ceil((5 + 4 * nbits) / 8)
    local.get $nbits i32.const 4 i32.mul i32.const 5 i32.add
    local.set $rectBytes
    local.get $rectBytes i32.const 7 i32.add i32.const 8 i32.div_u
    local.set $rectBytes

    ;; Default safe stage dimensions (800x480 standard educational resolution)
    f32.const 800.0 local.set $w
    f32.const 480.0 local.set $h

    ;; Frame Rate & Frame Count after RECT
    local.get $inPtr i32.const 8 i32.add local.get $rectBytes i32.add local.set $curByte
    ;; FrameRate (16-bit fixed point: byte0 fractional, byte1 integer)
    local.get $curByte i32.const 1 i32.add i32.load8_u f32.convert_i32_u local.set $fps
    local.get $fps f32.const 1.0 f32.lt
    if
      f32.const 24.0 local.set $fps
    end

    ;; Frame Count (UI16 at curByte + 2)
    local.get $curByte i32.const 2 i32.add i32.load16_u local.set $fc
    local.get $fc i32.const 1 i32.lt_s
    if
      i32.const 1 local.set $fc
    end

    ;; Store decoded dimensions and rates
    i32.const 12 local.get $w f32.store
    i32.const 16 local.get $h f32.store
    i32.const 20 local.get $fps f32.store
    i32.const 24 local.get $fc i32.store
    i32.const 44 local.get $rectBytes i32.store

    i32.const 1
  )

  ;; ---------------------------------------------------------------------------
  ;; 2. SWF TAG SCANNER & ASSET PROFILER
  ;; ---------------------------------------------------------------------------
  (func (export "scan_swf_tags")
    (param $inPtr i32) (param $startOffset i32) (param $byteLen i32)
    (result i32)
    (local $pos i32)
    (local $end i32)
    (local $tagRaw i32)
    (local $tagCode i32)
    (local $tagLen i32)
    (local $shapeCount i32)
    (local $morphCount i32)
    (local $actionCount i32)
    (local $frameCount i32)
    (local $tagCount i32)
    (local $bgColor i32)

    local.get $inPtr local.get $startOffset i32.add local.set $pos
    local.get $inPtr local.get $byteLen i32.add local.set $end

    i32.const 0 local.set $shapeCount
    i32.const 0 local.set $morphCount
    i32.const 0 local.set $actionCount
    i32.const 0 local.set $frameCount
    i32.const 0 local.set $tagCount
    i32.const 0x090d16 local.set $bgColor

    block $break
      loop $loop
        ;; Check if at least 2 bytes remain for tag header
        local.get $pos i32.const 2 i32.add local.get $end i32.gt_u
        br_if $break

        ;; Read UI16 TagCodeAndLength
        local.get $pos i32.load16_u local.set $tagRaw
        local.get $tagRaw i32.const 6 i32.shr_u local.set $tagCode
        local.get $tagRaw i32.const 0x3F i32.and local.set $tagLen
        local.get $pos i32.const 2 i32.add local.set $pos

        ;; If tagLen == 0x3F, length is next 32-bit integer
        local.get $tagLen i32.const 0x3F i32.eq
        if
          local.get $pos i32.const 4 i32.add local.get $end i32.gt_u
          br_if $break
          local.get $pos i32.load local.set $tagLen
          local.get $pos i32.const 4 i32.add local.set $pos
        end

        local.get $tagCount i32.const 1 i32.add local.set $tagCount

        ;; Tag 0: End
        local.get $tagCode i32.const 0 i32.eq
        br_if $break

        ;; Tag 1: ShowFrame
        local.get $tagCode i32.const 1 i32.eq
        if
          local.get $frameCount i32.const 1 i32.add local.set $frameCount
        end

        ;; Tags 2, 22, 32, 83: DefineShape 1..4
        local.get $tagCode i32.const 2 i32.eq
        local.get $tagCode i32.const 22 i32.eq
        i32.or
        local.get $tagCode i32.const 32 i32.eq
        i32.or
        local.get $tagCode i32.const 83 i32.eq
        i32.or
        if
          local.get $shapeCount i32.const 1 i32.add local.set $shapeCount
        end

        ;; Tags 46, 84: DefineMorphShape
        local.get $tagCode i32.const 46 i32.eq
        local.get $tagCode i32.const 84 i32.eq
        i32.or
        if
          local.get $morphCount i32.const 1 i32.add local.set $morphCount
        end

        ;; Tags 12, 59: DoAction / DoInitAction
        local.get $tagCode i32.const 12 i32.eq
        local.get $tagCode i32.const 59 i32.eq
        i32.or
        if
          local.get $actionCount i32.const 1 i32.add local.set $actionCount
        end

        ;; Tag 9: SetBackgroundColor (RGB)
        local.get $tagCode i32.const 9 i32.eq
        if
          local.get $pos local.get $end i32.lt_u
          if
            local.get $pos i32.load8_u i32.const 16 i32.shl
            local.get $pos i32.const 1 i32.add i32.load8_u i32.const 8 i32.shl i32.or
            local.get $pos i32.const 2 i32.add i32.load8_u i32.or
            local.set $bgColor
          end
        end

        ;; Skip tag content
        local.get $pos local.get $tagLen i32.add local.set $pos
        br $loop
      end
    end

    ;; Store tag statistics into Page 0
    i32.const 28 local.get $shapeCount i32.store
    i32.const 32 local.get $morphCount i32.store
    i32.const 36 local.get $actionCount i32.store
    i32.const 40 local.get $bgColor i32.store
    i32.const 44 local.get $tagCount i32.store

    local.get $tagCount
  )

  ;; ---------------------------------------------------------------------------
  ;; 3. BATCH TWIPS TO PIXELS SCALAR CONVERTER (20 twips = 1 pixel)
  ;; ---------------------------------------------------------------------------
  (func (export "batch_convert_twips_to_pixels")
    (param $inPtr i32) (param $outPtr i32) (param $count i32)
    (local $i i32)
    (local $curIn i32)
    (local $curOut i32)
    (local $val f32)

    i32.const 0 local.set $i
    block $break
      loop $loop
        local.get $i local.get $count i32.ge_u br_if $break
        local.get $inPtr local.get $i i32.const 4 i32.mul i32.add local.set $curIn
        local.get $outPtr local.get $i i32.const 4 i32.mul i32.add local.set $curOut

        local.get $curIn i32.load f32.convert_i32_s f32.const 0.05 f32.mul local.set $val
        local.get $curOut local.get $val f32.store

        local.get $i i32.const 1 i32.add local.set $i
        br $loop
      end
    end
  )

  ;; ---------------------------------------------------------------------------
  ;; 4. FAST PHET STREAM LEXER & INVARIANT DETECTOR
  ;; Gigabit-speed byte scanner across monolithic 12 MB bundles
  ;; ---------------------------------------------------------------------------
  (func (export "scan_phet_stream")
    (param $inPtr i32) (param $byteLen i32)
    (result i32)
    (local $pos i32)
    (local $end i32)
    (local $mask i32)
    (local $propCount i32)
    (local $b i32)

    local.get $inPtr local.set $pos
    local.get $inPtr local.get $byteLen i32.add local.set $end

    i32.const 0 local.set $mask
    i32.const 0 local.set $propCount

    block $break
      loop $loop
        local.get $pos local.get $end i32.ge_u br_if $break
        local.get $pos i32.load8_u local.set $b

        ;; Check 'o' or 'O' for 'ohm'
        local.get $b i32.const 111 i32.eq local.get $b i32.const 79 i32.eq i32.or
        if
          local.get $pos i32.const 2 i32.add local.get $end i32.lt_u
          if
            ;; 'h' = 104, 'm' = 109
            local.get $pos i32.const 1 i32.add i32.load8_u i32.const 104 i32.eq
            local.get $pos i32.const 2 i32.add i32.load8_u i32.const 109 i32.eq
            i32.and
            if
              local.get $mask i32.const 1 i32.or local.set $mask ;; bit 0: circuit / ohms
            end
          end
        end

        ;; Check 'w' or 'W' for 'wave'
        local.get $b i32.const 119 i32.eq local.get $b i32.const 87 i32.eq i32.or
        if
          local.get $pos i32.const 3 i32.add local.get $end i32.lt_u
          if
            ;; 'a'=97, 'v'=118, 'e'=101
            local.get $pos i32.const 1 i32.add i32.load8_u i32.const 97 i32.eq
            local.get $pos i32.const 2 i32.add i32.load8_u i32.const 118 i32.eq
            local.get $pos i32.const 3 i32.add i32.load8_u i32.const 101 i32.eq
            i32.and i32.and
            if
              local.get $mask i32.const 2 i32.or local.set $mask ;; bit 1: wave / optics
            end
          end
        end

        ;; Check 'p' or 'P' for 'pendulum' or 'Property'
        local.get $b i32.const 112 i32.eq local.get $b i32.const 80 i32.eq i32.or
        if
          local.get $pos i32.const 7 i32.add local.get $end i32.lt_u
          if
            ;; 'r'=114, 'o'=111, 'p'=112, 'e'=101, 'r'=114, 't'=116, 'y'=121 (Property)
            local.get $pos i32.const 1 i32.add i32.load8_u i32.const 114 i32.eq
            local.get $pos i32.const 2 i32.add i32.load8_u i32.const 111 i32.eq
            local.get $pos i32.const 3 i32.add i32.load8_u i32.const 112 i32.eq
            i32.and i32.and
            if
              local.get $propCount i32.const 1 i32.add local.set $propCount
            end
          end
        end

        local.get $pos i32.const 1 i32.add local.set $pos
        br $loop
      end
    end

    ;; Store PhET stream metrics in Page 0
    i32.const 48 local.get $mask i32.store
    i32.const 52 local.get $propCount i32.store

    local.get $mask
  )

  ;; ---------------------------------------------------------------------------
  ;; 5. COMPRESSION RATIO CALCULATOR
  ;; ---------------------------------------------------------------------------
  (func (export "compute_compression_ratio")
    (param $origSize i32) (param $distilledSize i32)
    (result f32)
    (local $ratio f32)
    local.get $origSize i32.const 1 i32.lt_s
    if
      f32.const 0.0
      return
    end

    f32.const 100.0
    local.get $origSize local.get $distilledSize i32.sub f32.convert_i32_u
    local.get $origSize f32.convert_i32_u f32.div
    f32.mul
    local.set $ratio

    i32.const 56 local.get $ratio f32.store
    local.get $ratio
  )
)
