;; =============================================================================
;; St Joseph's Curriculum Portal — British Sign Language (BSL) AST Codebook
;; Canonical 32-Bit Quantized Hex Bitfield & Kinematic AST (Phase 2)
;; 
;; Schema: #x<DEZ:2><TAB:2><SIG:2><ORI:2><ASPECT:1>
;; Bitmask: Hand(8b) | Locus(6b) | Traj(8b) | Ori(6b) | Aspect(4b)
;; Addressing: (:g Group_0..63 :w Word_0..31)
;; =============================================================================

(bsl-codebook :version "2.0.0-PHASE2" :standard "BANZSL" :grid "64x32" :signs-count 60

  ;; ===========================================================================
  ;; GROUP 00: SOCIAL DISCOURSE, POLITE GREETINGS & EXCHANGES
  ;; ===========================================================================
  (group :id 0 :label "CORE_SOCIAL_DISCOURSE"
    (sign :g 0 :w 0 :id "hello" :hex #x010201040 :viseme "hello"
      (kf :idx 1 :shape :flat :pos [60 -55 28] :ori :outward :nmf (nmf :brows "raised"))
      (kf :idx 2 :shape :flat :pos [85 -40 50] :ori :outward :aspect :standard :nmf (nmf :brows "raised" :tilt "nod")))

    (sign :g 0 :w 1 :id "thank-you" :hex #x010103040 :viseme "thank you"
      (kf :idx 1 :shape :flat :pos [0 -45 24] :ori :inward :nmf (nmf :brows "raised"))
      (kf :idx 2 :shape :flat :pos [0 5 65]   :ori :outward :aspect :standard :nmf (nmf :brows "raised" :tilt "nod")))

    (sign :g 0 :w 2 :id "please" :hex #x010103040 :viseme "please"
      (kf :idx 1 :shape :flat :pos [0 -45 24] :ori :inward :nmf (nmf :brows "raised"))
      (kf :idx 2 :shape :flat :pos [0 15 60]  :ori :outward :aspect :standard :nmf (nmf :brows "raised" :tilt "nod")))

    (sign :g 0 :w 3 :id "yes" :hex #x020002043 :viseme "yes"
      (kf :idx 1 :shape :fist :pos [35 -10 25] :ori :outward :nmf (nmf :brows "raised"))
      (kf :idx 2 :shape :fist :pos [35 30 25]  :ori :outward :aspect :habitual :nmf (nmf :brows "raised" :tilt "nod")))

    (sign :g 0 :w 4 :id "no" :hex #x030007033 :viseme "no"
      (kf :idx 1 :shape :point :pos [35 -25 25] :ori :inward :nmf (nmf :brows "furrowed"))
      (kf :idx 2 :shape :point :pos [35 0 25]   :ori :inward :aspect :habitual :nmf (nmf :brows "furrowed")))

    (sign :g 0 :w 5 :id "good" :hex #x090407020 :viseme "good"
      (kf :idx 1 :shape :thumb-up :pos [25 0 25]  :ori :supine :nmf (nmf :brows "raised"))
      (kf :idx 2 :shape :thumb-up :pos [20 10 50] :ori :supine :aspect :standard :nmf (nmf :brows "raised" :tilt "nod")))

    (sign :g 0 :w 6 :id "sorry" :hex #x02030A031 :viseme "sorry"
      (kf :idx 1 :shape :fist :pos [-15 0 20]  :ori :inward :nmf (nmf :brows "furrowed"))
      (kf :idx 2 :shape :fist :pos [-20 10 22] :ori :inward :aspect :durative :nmf (nmf :brows "furrowed" :tilt "nod")))

    (sign :g 0 :w 7 :id "welcome" :hex #x010008031 :viseme "welcome"
      (kf :idx 1 :shape :flat :pos [65 0 30] :ori :inward :base-mode :mirror :nmf (nmf :brows "raised"))
      (kf :idx 2 :shape :flat :pos [15 5 25] :ori :inward :aspect :durative :base-mode :mirror :nmf (nmf :brows "raised" :tilt "nod")))

    (sign :g 0 :w 8 :id "goodbye" :hex #x010201041 :viseme "goodbye"
      (kf :idx 1 :shape :flat :pos [45 -50 30] :ori :outward :nmf (nmf :brows "raised"))
      (kf :idx 2 :shape :flat :pos [75 -45 35] :ori :outward :aspect :durative :nmf (nmf :brows "raised" :tilt "tilt-right")))

    (sign :g 0 :w 9 :id "how-are-you" :hex #x090303043 :viseme "how are you"
      (kf :idx 1 :shape :flat     :pos [-10 15 22] :ori :inward  :base-mode :mirror :nmf (nmf :brows "furrowed"))
      (kf :idx 2 :shape :thumb-up :pos [25 5 45]   :ori :outward :aspect :habitual :base-mode :mirror :nmf (nmf :brows "raised" :tilt "tilt-left")))

    (sign :g 0 :w 10 :id "friend" :hex #x030407053 :viseme "friend"
      (kf :idx 1 :shape :point :pos [-45 -10 20] :ori :lateral :nmf (nmf :brows "raised"))
      (kf :idx 2 :shape :point :pos [-55 5 16]   :ori :lateral :aspect :habitual :nmf (nmf :brows "raised" :tilt "nod")))

    (sign :g 0 :w 11 :id "family" :hex #x060004031 :viseme "family"
      (kf :idx 1 :shape :claw :pos [30 5 30] :ori :inward :base-mode :mirror :nmf (nmf :brows "raised"))
      (kf :idx 2 :shape :claw :pos [0 15 25] :ori :inward :aspect :durative :base-mode :mirror :nmf (nmf :brows "raised" :tilt "nod")))

    (sign :g 0 :w 12 :id "happy" :hex #x010302033 :viseme "happy"
      (kf :idx 1 :shape :flat :pos [-10 10 20] :ori :inward :nmf (nmf :brows "raised"))
      (kf :idx 2 :shape :flat :pos [10 -25 30] :ori :inward :aspect :habitual :nmf (nmf :brows "raised" :tilt "nod")))

    (sign :g 0 :w 13 :id "sad" :hex #x010102031 :viseme "sad"
      (kf :idx 1 :shape :flat :pos [40 -50 25] :ori :inward :nmf (nmf :brows "furrowed"))
      (kf :idx 2 :shape :flat :pos [20 25 20]  :ori :inward :aspect :durative :nmf (nmf :brows "furrowed" :tilt "nod")))

    (sign :g 0 :w 14 :id "like" :hex #x010303030 :viseme "like"
      (kf :idx 1 :shape :flat :pos [-10 -5 20] :ori :inward :nmf (nmf :brows "raised"))
      (kf :idx 2 :shape :flat :pos [5 -5 35]   :ori :inward :aspect :standard :nmf (nmf :brows "raised" :tilt "nod")))

    (sign :g 0 :w 15 :id "more" :hex #x010403020 :viseme "more"
      (kf :idx 1 :shape :flat :pos [-45 20 14] :ori :supine :base-mode :vowel-board :nmf (nmf :brows "raised"))
      (kf :idx 2 :shape :flat :pos [-20 0 45]  :ori :supine :aspect :standard :base-mode :vowel-board :nmf (nmf :brows "raised" :tilt "nod")))

    (sign :g 0 :w 16 :id "again" :hex #x050407013 :viseme "again"
      (kf :idx 1 :shape :v :pos [-45 -10 25] :ori :prone :base-mode :vowel-board :nmf (nmf :brows "raised"))
      (kf :idx 2 :shape :v :pos [-45 25 14]  :ori :prone :aspect :habitual :base-mode :vowel-board :nmf (nmf :brows "raised" :tilt "nod")))

    (sign :g 0 :w 17 :id "all" :hex #x010008021 :viseme "all"
      (kf :idx 1 :shape :flat :pos [60 -10 30] :ori :supine :base-mode :mirror :nmf (nmf :brows "raised"))
      (kf :idx 2 :shape :flat :pos [-10 10 25] :ori :supine :aspect :durative :base-mode :mirror :nmf (nmf :brows "raised" :tilt "nod")))
  )

  ;; ===========================================================================
  ;; GROUP 01: SCHOOL LIFE, CLASSROOM DIRECTIVES & DAILY ROUTINES
  ;; ===========================================================================
  (group :id 1 :label "SCHOOL_AND_ROUTINES"
    (sign :g 1 :w 0 :id "school" :hex #x010407013 :viseme "school"
      (kf :idx 1 :shape :flat :pos [-45 20 12]  :ori :prone :nmf (nmf :brows "neutral"))
      (kf :idx 2 :shape :flat :pos [-35 -10 25] :ori :prone :nmf (nmf :brows "neutral"))
      (kf :idx 3 :shape :flat :pos [-45 20 12]  :ori :prone :aspect :habitual :nmf (nmf :brows "neutral")))

    (sign :g 1 :w 1 :id "teacher" :hex #x060203040 :viseme "teacher"
      (kf :idx 1 :shape :claw   :pos [50 -65 28] :ori :outward :base-mode :mirror :nmf (nmf :brows "neutral"))
      (kf :idx 2 :shape :spread :pos [30 -20 65] :ori :outward :aspect :standard :base-mode :mirror :nmf (nmf :brows "neutral")))

    (sign :g 1 :w 2 :id "learn" :hex #x060402031 :viseme "learn"
      (kf :idx 1 :shape :claw :pos [-45 25 14] :ori :inward :nmf (nmf :brows "neutral"))
      (kf :idx 2 :shape :flat :pos [15 -65 30] :ori :inward :aspect :durative :nmf (nmf :brows "raised" :tilt "nod")))

    (sign :g 1 :w 3 :id "book" :hex #x010009020 :viseme "book"
      (kf :idx 1 :shape :flat :pos [-10 15 20] :ori :lateral :nmf (nmf :brows "neutral"))
      (kf :idx 2 :shape :flat :pos [25 20 15]  :ori :supine  :aspect :standard :nmf (nmf :brows "neutral")))

    (sign :g 1 :w 4 :id "read" :hex #x050402011 :viseme "read"
      (kf :idx 1 :shape :v :pos [-60 -25 20] :ori :prone :nmf (nmf :brows "neutral"))
      (kf :idx 2 :shape :v :pos [-50 35 18]  :ori :prone :aspect :durative :nmf (nmf :brows "neutral")))

    (sign :g 1 :w 5 :id "write" :hex #x070401011 :viseme "write"
      (kf :idx 1 :shape :pinch :pos [-70 20 14] :ori :prone :nmf (nmf :brows "neutral"))
      (kf :idx 2 :shape :pinch :pos [-30 25 14] :ori :prone :aspect :durative :nmf (nmf :brows "neutral")))

    (sign :g 1 :w 6 :id "question" :hex #x030004043 :viseme "question"
      (kf :idx 1 :shape :point :pos [25 -35 30] :ori :outward :nmf (nmf :brows "furrowed"))
      (kf :idx 2 :shape :point :pos [25 -5 30]  :ori :outward :nmf (nmf :brows "furrowed"))
      (kf :idx 3 :shape :point :pos [25 25 30]  :ori :outward :aspect :habitual :nmf (nmf :brows "raised")))

    (sign :g 1 :w 7 :id "listen" :hex #x040807050 :viseme "listen"
      (kf :idx 1 :shape :claw :pos [75 -55 25] :ori :lateral :nmf (nmf :brows "raised" :tilt "tilt-right"))
      (kf :idx 2 :shape :claw :pos [65 -55 22] :ori :lateral :aspect :standard :nmf (nmf :brows "raised" :tilt "tilt-right")))

    (sign :g 1 :w 8 :id "help" :hex #x090403020 :viseme "help"
      (kf :idx 1 :shape :thumb-up :pos [-40 30 14] :ori :supine :nmf (nmf :brows "raised"))
      (kf :idx 2 :shape :thumb-up :pos [-25 5 45]  :ori :supine :aspect :standard :nmf (nmf :brows "raised" :tilt "nod")))

    (sign :g 1 :w 9 :id "start" :hex #x030409052 :viseme "start"
      (kf :idx 1 :shape :point :pos [-45 15 16] :ori :lateral :base-mode :vowel-board :nmf (nmf :brows "raised"))
      (kf :idx 2 :shape :point :pos [-35 10 25] :ori :lateral :aspect :intensive :base-mode :vowel-board :nmf (nmf :brows "raised" :tilt "nod")))

    (sign :g 1 :w 10 :id "stop" :hex #x010402012 :viseme "stop"
      (kf :idx 1 :shape :flat :pos [-40 -10 25] :ori :lateral :base-mode :vowel-board :nmf (nmf :brows "furrowed"))
      (kf :idx 2 :shape :flat :pos [-45 25 12]  :ori :prone   :aspect :intensive :base-mode :vowel-board :nmf (nmf :brows "furrowed" :tilt "nod")))

    (sign :g 1 :w 11 :id "sit" :hex #x060402012 :viseme "sit"
      (kf :idx 1 :shape :claw :pos [-45 0 22]  :ori :prone :base-mode :vowel-board :nmf (nmf :brows "neutral"))
      (kf :idx 2 :shape :claw :pos [-45 25 14] :ori :prone :aspect :intensive :base-mode :vowel-board :nmf (nmf :brows "neutral" :tilt "nod")))

    (sign :g 1 :w 12 :id "stand" :hex #x050402011 :viseme "stand"
      (kf :idx 1 :shape :v :pos [-45 20 14]  :ori :prone :base-mode :vowel-board :nmf (nmf :brows "raised"))
      (kf :idx 2 :shape :v :pos [-35 -25 30] :ori :prone :aspect :durative :base-mode :vowel-board :nmf (nmf :brows "raised" :tilt "nod")))

    (sign :g 1 :w 13 :id "wait" :hex #x010003041 :viseme "wait"
      (kf :idx 1 :shape :flat :pos [25 -10 45] :ori :outward :base-mode :mirror :nmf (nmf :brows "neutral"))
      (kf :idx 2 :shape :flat :pos [25 -5 55]  :ori :outward :aspect :durative :base-mode :mirror :nmf (nmf :brows "neutral" :tilt "nod")))

    (sign :g 1 :w 14 :id "finish" :hex #x0A0001042 :viseme "finish"
      (kf :idx 1 :shape :flat   :pos [-10 5 25] :ori :inward  :base-mode :mirror :nmf (nmf :brows "raised"))
      (kf :idx 2 :shape :spread :pos [45 20 35] :ori :outward :aspect :intensive :base-mode :mirror :nmf (nmf :brows "raised" :tilt "nod")))

    (sign :g 1 :w 15 :id "correct" :hex #x030407013 :viseme "correct"
      (kf :idx 1 :shape :point :pos [-45 15 18] :ori :prone :base-mode :vowel-board :nmf (nmf :brows "raised"))
      (kf :idx 2 :shape :point :pos [-45 15 18] :ori :prone :aspect :habitual :base-mode :vowel-board :nmf (nmf :brows "raised" :tilt "nod")))

    (sign :g 1 :w 16 :id "wrong" :hex #x060107053 :viseme "wrong"
      (kf :idx 1 :shape :claw :pos [25 -45 24] :ori :lateral :nmf (nmf :brows "furrowed" :tilt "tilt-left"))
      (kf :idx 2 :shape :claw :pos [25 -45 24] :ori :lateral :aspect :habitual :nmf (nmf :brows "furrowed" :tilt "tilt-right")))

    (sign :g 1 :w 17 :id "eat" :hex #x020107033 :viseme "eat"
      (kf :idx 1 :shape :fist :pos [5 -45 22] :ori :inward :hold 120 :nmf (nmf :brows "neutral"))
      (kf :idx 2 :shape :fist :pos [0 -46 24] :ori :inward :aspect :habitual :hold 150 :nmf (nmf :brows "neutral" :tilt "nod")))

    (sign :g 1 :w 18 :id "drink" :hex #x040109051 :viseme "drink"
      (kf :idx 1 :shape :c-shape :pos [10 -38 20] :ori :lateral :hold 100 :nmf (nmf :brows "neutral"))
      (kf :idx 2 :shape :c-shape :pos [5 -44 24]  :ori :inward  :aspect :durative :hold 150 :nmf (nmf :brows "neutral" :tilt "nod")))

    (sign :g 1 :w 19 :id "toilet" :hex #x030807033 :viseme "toilet"
      (kf :idx 1 :shape :point :pos [-35 -18 15] :ori :inward :hold 120 :nmf (nmf :brows "neutral"))
      (kf :idx 2 :shape :point :pos [-38 -18 12] :ori :inward :aspect :habitual :hold 150 :nmf (nmf :brows "neutral")))

    (sign :g 1 :w 20 :id "wash" :hex #x02040A011 :viseme "wash"
      (kf :idx 1 :shape :fist :pos [-5 15 20] :ori :prone :base-mode :vowel-board :hold 130 :nmf (nmf :brows "neutral"))
      (kf :idx 2 :shape :fist :pos [5 12 22]  :ori :prone :aspect :durative :base-mode :vowel-board :hold 150 :nmf (nmf :brows "neutral")))

    (sign :g 1 :w 21 :id "walk" :hex #x050006031 :viseme "walk"
      (kf :idx 1 :shape :v :pos [10 25 25] :ori :inward :hold 120 :nmf (nmf :brows "neutral"))
      (kf :idx 2 :shape :v :pos [20 28 32] :ori :inward :aspect :durative :hold 150 :nmf (nmf :brows "neutral" :tilt "nod")))
  )

  ;; ===========================================================================
  ;; GROUP 02: GRAMMATICAL MARKERS, INTERROGATIVES & PRO-FORMS
  ;; ===========================================================================
  (group :id 2 :label "GRAMMAR_AND_PROFORMS"
    (sign :g 2 :w 0 :id "look" :hex #x050203040 :viseme "look"
      (kf :idx 1 :shape :v :pos [35 -45 25] :ori :outward :nmf (nmf :brows "raised"))
      (kf :idx 2 :shape :v :pos [25 -25 65] :ori :outward :aspect :standard :nmf (nmf :brows "raised")))

    (sign :g 2 :w 1 :id "give" :hex #x010003020 :viseme "give"
      (kf :idx 1 :shape :flat :pos [20 25 20]  :ori :supine  :nmf (nmf :brows "neutral"))
      (kf :idx 2 :shape :flat :pos [10 -15 60] :ori :outward :aspect :standard :nmf (nmf :brows "neutral" :tilt "nod")))

    (sign :g 2 :w 2 :id "tell" :hex #x030103040 :viseme "tell"
      (kf :idx 1 :shape :point :pos [12 -52 24] :ori :outward :nmf (nmf :brows "neutral"))
      (kf :idx 2 :shape :point :pos [8 -25 58]  :ori :outward :aspect :standard :nmf (nmf :brows "neutral")))

    (sign :g 2 :w 3 :id "ask" :hex #x030003040 :viseme "ask"
      (kf :idx 1 :shape :point :pos [15 10 30] :ori :outward :nmf (nmf :brows "furrowed"))
      (kf :idx 2 :shape :point :pos [5 -15 62] :ori :outward :aspect :standard :nmf (nmf :brows "furrowed" :tilt "nod")))

    (sign :g 2 :w 4 :id "show" :hex #x030403040 :viseme "show"
      (kf :idx 1 :shape :point :pos [-35 5 25]  :ori :outward :base-mode :vowel-board :nmf (nmf :brows "neutral"))
      (kf :idx 2 :shape :point :pos [-20 -20 55] :ori :outward :aspect :standard :base-mode :vowel-board :nmf (nmf :brows "raised" :tilt "nod")))

    (sign :g 2 :w 5 :id "explain" :hex #x0A0003041 :viseme "explain"
      (kf :idx 1 :shape :spread :pos [25 -10 45] :ori :outward :base-mode :mirror :nmf (nmf :brows "neutral"))
      (kf :idx 2 :shape :claw   :pos [10 5 30]   :ori :outward :aspect :durative :base-mode :mirror :nmf (nmf :brows "neutral")))

    (sign :g 2 :w 6 :id "what" :hex #x010001021 :viseme "what"
      (kf :idx 1 :shape :flat :pos [15 10 30] :ori :supine :base-mode :mirror :nmf (nmf :brows "furrowed"))
      (kf :idx 2 :shape :flat :pos [45 15 35] :ori :supine :aspect :durative :base-mode :mirror :nmf (nmf :brows "furrowed" :tilt "nod")))

    (sign :g 2 :w 7 :id "where" :hex #x010004021 :viseme "where"
      (kf :idx 1 :shape :flat :pos [20 15 25] :ori :supine :base-mode :mirror :nmf (nmf :brows "furrowed"))
      (kf :idx 2 :shape :flat :pos [40 15 35] :ori :supine :aspect :durative :base-mode :mirror :nmf (nmf :brows "furrowed" :tilt "tilt-left")))

    (sign :g 2 :w 8 :id "who" :hex #x030104043 :viseme "who"
      (kf :idx 1 :shape :point :pos [30 -45 24] :ori :outward :nmf (nmf :brows "furrowed"))
      (kf :idx 2 :shape :point :pos [25 -40 26] :ori :outward :aspect :habitual :nmf (nmf :brows "furrowed" :tilt "nod")))

    (sign :g 2 :w 9 :id "why" :hex #x030307030 :viseme "why"
      (kf :idx 1 :shape :point :pos [-20 -10 20] :ori :inward :nmf (nmf :brows "furrowed"))
      (kf :idx 2 :shape :point :pos [-5 -20 35]  :ori :inward :aspect :standard :nmf (nmf :brows "furrowed" :tilt "tilt-right")))

    (sign :g 2 :w 10 :id "when" :hex #x0A0103041 :viseme "when"
      (kf :idx 1 :shape :spread :pos [45 -50 25] :ori :outward :nmf (nmf :brows "furrowed"))
      (kf :idx 2 :shape :spread :pos [55 -35 45] :ori :outward :aspect :durative :nmf (nmf :brows "furrowed" :tilt "nod")))

    (sign :g 2 :w 11 :id "how" :hex #x010009022 :viseme "how"
      (kf :idx 1 :shape :claw :pos [-10 10 25] :ori :prone  :base-mode :mirror :nmf (nmf :brows "furrowed"))
      (kf :idx 2 :shape :flat :pos [25 20 35]  :ori :supine :aspect :intensive :base-mode :mirror :nmf (nmf :brows "furrowed" :tilt "tilt-left")))

    (sign :g 2 :w 12 :id "me" :hex #x030307030 :viseme "me"
      (kf :idx 1 :shape :point :pos [10 0 15] :ori :inward :nmf (nmf :brows "neutral"))
      (kf :idx 2 :shape :point :pos [0 10 8]  :ori :inward :aspect :standard :nmf (nmf :brows "neutral")))

    (sign :g 2 :w 13 :id "you" :hex #x030003040 :viseme "you"
      (kf :idx 1 :shape :point :pos [10 -10 35] :ori :outward :nmf (nmf :brows "neutral"))
      (kf :idx 2 :shape :point :pos [0 -20 65]  :ori :outward :aspect :standard :nmf (nmf :brows "neutral")))

    (sign :g 2 :w 14 :id "they" :hex #x030601041 :viseme "they"
      (kf :idx 1 :shape :point :pos [-45 -5 35] :ori :outward :nmf (nmf :brows "neutral"))
      (kf :idx 2 :shape :point :pos [45 -5 35]  :ori :outward :aspect :durative :nmf (nmf :brows "neutral")))

    (sign :g 2 :w 15 :id "understand" :hex #x030202044 :viseme "understand"
      (kf :idx 1 :shape :fist  :pos [32 -48 18] :ori :outward :nmf (nmf :brows "raised"))
      (kf :idx 2 :shape :point :pos [32 -72 25] :ori :outward :aspect :accelerative :nmf (nmf :brows "raised" :tilt "nod")))

    (sign :g 2 :w 16 :id "agree" :hex #x010402012 :viseme "agree"
      (kf :idx 1 :shape :point :pos [30 -52 20] :ori :inward :nmf (nmf :brows "raised"))
      (kf :idx 2 :shape :flat  :pos [-30 15 22] :ori :prone  :aspect :intensive :base-mode :vowel-board :nmf (nmf :brows "raised" :tilt "nod")))

    (sign :g 2 :w 17 :id "disagree" :hex #x030007033 :viseme "disagree"
      (kf :idx 1 :shape :point :pos [30 -52 20] :ori :inward :nmf (nmf :brows "furrowed"))
      (kf :idx 2 :shape :point :pos [0 5 28]    :ori :inward :aspect :habitual :base-mode :mirror :nmf (nmf :brows "furrowed" :tilt "shake")))

    (sign :g 2 :w 18 :id "think" :hex #x030207033 :viseme "think"
      (kf :idx 1 :shape :point :pos [28 -52 22] :ori :inward :nmf (nmf :brows "raised"))
      (kf :idx 2 :shape :point :pos [28 -50 20] :ori :inward :aspect :habitual :nmf (nmf :brows "raised")))

    (sign :g 2 :w 19 :id "know" :hex #x010207033 :viseme "know"
      (kf :idx 1 :shape :flat :pos [25 -55 22] :ori :inward :nmf (nmf :brows "raised"))
      (kf :idx 2 :shape :flat :pos [25 -53 20] :ori :inward :aspect :habitual :nmf (nmf :brows "raised" :tilt "nod")))

    (sign :g 2 :w 20 :id "want" :hex #x060003021 :viseme "want"
      (kf :idx 1 :shape :claw :pos [25 0 45]  :ori :supine :base-mode :mirror :nmf (nmf :brows "raised"))
      (kf :idx 2 :shape :claw :pos [20 20 25] :ori :supine :aspect :durative :base-mode :mirror :nmf (nmf :brows "neutral" :tilt "nod")))

    (sign :g 2 :w 21 :id "can" :hex #x020002012 :viseme "can"
      (kf :idx 1 :shape :fist :pos [25 15 25] :ori :prone :base-mode :mirror :nmf (nmf :brows "raised"))
      (kf :idx 2 :shape :fist :pos [25 38 25] :ori :prone :aspect :intensive :base-mode :mirror :nmf (nmf :brows "raised" :tilt "nod")))

    (sign :g 2 :w 22 :id "cannot" :hex #x030402012 :viseme "cannot"
      (kf :idx 1 :shape :point :pos [-25 -5 25] :ori :prone :base-mode :vowel-board :nmf (nmf :brows "furrowed"))
      (kf :idx 2 :shape :point :pos [-25 30 25] :ori :prone :aspect :intensive :base-mode :vowel-board :nmf (nmf :brows "furrowed" :tilt "shake")))

    (sign :g 2 :w 23 :id "if" :hex #x030107033 :viseme "if"
      (kf :idx 1 :shape :point :pos [30 -45 20] :ori :inward :nmf (nmf :brows "raised"))
      (kf :idx 2 :shape :point :pos [30 -43 18] :ori :inward :aspect :habitual :nmf (nmf :brows "raised")))
  )

  ;; ===========================================================================
  ;; GROUP 03: TEMPORAL HORIZON & TIMELINE (CHRONOLOGICAL REPERTOIRE)
  ;; ===========================================================================
  (group :id 3 :label "TEMPORAL_HORIZON"
    (sign :g 3 :w 0 :id "yesterday" :hex #x090103031 :viseme "yesterday"
      (kf :idx 1 :shape :fist :pos [45 -45 22]  :ori :inward :nmf (nmf :brows "neutral"))
      (kf :idx 2 :shape :fist :pos [60 -60 -10] :ori :inward :aspect :durative :nmf (nmf :brows "neutral" :tilt "tilt-right")))

    (sign :g 3 :w 1 :id "today" :hex #x010002023 :viseme "today"
      (kf :idx 1 :shape :flat :pos [35 15 25] :ori :supine :base-mode :mirror :nmf (nmf :brows "neutral"))
      (kf :idx 2 :shape :flat :pos [35 40 25] :ori :supine :aspect :habitual :base-mode :mirror :nmf (nmf :brows "neutral" :tilt "nod")))

    (sign :g 3 :w 2 :id "tomorrow" :hex #x090103041 :viseme "tomorrow"
      (kf :idx 1 :shape :fist :pos [42 -40 18] :ori :outward :nmf (nmf :brows "neutral"))
      (kf :idx 2 :shape :fist :pos [30 -30 52] :ori :outward :aspect :durative :nmf (nmf :brows "neutral")))

    (sign :g 3 :w 3 :id "now" :hex #x010002012 :viseme "now"
      (kf :idx 1 :shape :flat :pos [30 10 25] :ori :prone :base-mode :mirror :nmf (nmf :brows "raised"))
      (kf :idx 2 :shape :flat :pos [30 35 25] :ori :prone :aspect :intensive :base-mode :mirror :nmf (nmf :brows "raised" :tilt "nod")))

    (sign :g 3 :w 4 :id "future" :hex #x010203041 :viseme "future"
      (kf :idx 1 :shape :flat :pos [35 -55 22] :ori :outward :nmf (nmf :brows "raised"))
      (kf :idx 2 :shape :flat :pos [20 -35 70] :ori :outward :aspect :durative :nmf (nmf :brows "raised")))

    (sign :g 3 :w 5 :id "past" :hex #x010203031 :viseme "past"
      (kf :idx 1 :shape :flat :pos [40 -30 20]  :ori :inward :nmf (nmf :brows "neutral"))
      (kf :idx 2 :shape :flat :pos [55 -50 -15] :ori :inward :aspect :durative :nmf (nmf :brows "neutral" :tilt "tilt-right")))

    (sign :g 3 :w 6 :id "morning" :hex #x0A0402021 :viseme "morning"
      (kf :idx 1 :shape :flat   :pos [-10 35 20] :ori :supine :base-mode :vowel-board :nmf (nmf :brows "neutral"))
      (kf :idx 2 :shape :spread :pos [0 -20 32]  :ori :supine :aspect :durative :base-mode :vowel-board :nmf (nmf :brows "raised" :tilt "nod")))

    (sign :g 3 :w 7 :id "afternoon" :hex #x010402011 :viseme "afternoon"
      (kf :idx 1 :shape :flat :pos [15 -30 30] :ori :prone :base-mode :vowel-board :nmf (nmf :brows "neutral"))
      (kf :idx 2 :shape :flat :pos [25 5 30]   :ori :prone :aspect :durative :base-mode :vowel-board :nmf (nmf :brows "neutral")))

    (sign :g 3 :w 8 :id "time" :hex #x030407013 :viseme "time"
      (kf :idx 1 :shape :point :pos [-55 35 10] :ori :prone :base-shift [-20 20 0] :nmf (nmf :brows "neutral"))
      (kf :idx 2 :shape :point :pos [-50 15 20] :ori :prone :base-shift [-20 20 0] :nmf (nmf :brows "neutral"))
      (kf :idx 3 :shape :point :pos [-55 35 10] :ori :prone :aspect :habitual :base-shift [-20 20 0] :nmf (nmf :brows "neutral")))
  )

  ;; ===========================================================================
  ;; GROUP 04: STEM CONCEPTS, FORCES & CELESTIAL MECHANICS
  ;; ===========================================================================
  (group :id 4 :label "STEM_AND_CELESTIAL"
    (sign :g 4 :w 0 :id "gravity" :hex #x010402012 :viseme "gravity"
      (kf :idx 1 :shape :flat :pos [-20 -20 30] :ori :prone :base-shift [-10 25 0] :nmf (nmf :brows "furrowed"))
      (kf :idx 2 :shape :flat :pos [-40 30 15]  :ori :prone :aspect :intensive :base-shift [-10 25 0] :nmf (nmf :brows "furrowed" :tilt "nod")))

    (sign :g 4 :w 1 :id "fast" :hex #x030403044 :viseme "fast"
      (kf :idx 1 :shape :point :pos [-45 0 20]  :ori :outward :base-shift [-15 10 0] :nmf (nmf :brows "raised"))
      (kf :idx 2 :shape :point :pos [10 -10 50] :ori :outward :aspect :accelerative :base-shift [-15 10 0] :nmf (nmf :brows "raised" :tilt "nod")))

    (sign :g 4 :w 2 :id "orbit" :hex #x030004011 :viseme "orbit"
      (kf :idx 1 :shape :point :pos [-40 10 15] :ori :prone :base-shift [-15 20 0] :nmf (nmf :brows "neutral"))
      (kf :idx 2 :shape :point :pos [25 15 45]  :ori :prone :base-shift [-15 20 0] :nmf (nmf :brows "neutral"))
      (kf :idx 3 :shape :point :pos [-35 10 20] :ori :prone :aspect :durative :base-shift [-15 20 0] :nmf (nmf :brows "neutral")))

    (sign :g 4 :w 3 :id "force" :hex #x010003042 :viseme "force"
      (kf :idx 1 :shape :flat :pos [0 -10 20] :ori :outward :base-shift [-30 0 0] :nmf (nmf :brows "furrowed"))
      (kf :idx 2 :shape :flat :pos [0 -5 65]  :ori :outward :aspect :intensive :base-shift [-30 0 0] :nmf (nmf :brows "furrowed" :tilt "nod")))

    (sign :g 4 :w 4 :id "energy" :hex #x060802031 :viseme "energy"
      (kf :idx 1 :shape :claw :pos [40 -15 20] :ori :inward :nmf (nmf :brows "neutral"))
      (kf :idx 2 :shape :claw :pos [25 25 25]  :ori :inward :aspect :durative :nmf (nmf :brows "raised" :tilt "nod")))

    (sign :g 4 :w 5 :id "water" :hex #x030107033 :viseme "water"
      (kf :idx 1 :shape :point :pos [25 -45 22] :ori :inward :nmf (nmf :brows "neutral"))
      (kf :idx 2 :shape :point :pos [25 -45 22] :ori :inward :aspect :habitual :nmf (nmf :brows "neutral")))

    (sign :g 4 :w 6 :id "light" :hex #x0A0205041 :viseme "light"
      (kf :idx 1 :shape :pinch  :pos [50 -55 25] :ori :outward :nmf (nmf :brows "raised"))
      (kf :idx 2 :shape :spread :pos [30 -10 55] :ori :outward :aspect :durative :nmf (nmf :brows "raised")))

    (sign :g 4 :w 7 :id "sun" :hex #x0A0505041 :viseme "sun"
      (kf :idx 1 :shape :point  :pos [20 -70 30] :ori :outward :nmf (nmf :brows "raised"))
      (kf :idx 2 :shape :spread :pos [35 -40 50] :ori :outward :aspect :durative :nmf (nmf :brows "raised" :tilt "tilt-right")))

    (sign :g 4 :w 8 :id "planet" :hex #x060404011 :viseme "planet"
      (kf :idx 1 :shape :claw :pos [-25 0 25] :ori :prone :base-shift [-10 10 0] :nmf (nmf :brows "neutral"))
      (kf :idx 2 :shape :claw :pos [35 10 30] :ori :prone :aspect :durative :base-shift [-10 10 0] :nmf (nmf :brows "neutral")))

    (sign :g 4 :w 9 :id "earth" :hex #x060009051 :viseme "earth"
      (kf :idx 1 :shape :claw :pos [-10 5 30] :ori :lateral :base-shift [-30 0 0] :nmf (nmf :brows "neutral"))
      (kf :idx 2 :shape :claw :pos [15 15 32] :ori :lateral :aspect :durative :base-shift [-30 -10 0] :nmf (nmf :brows "neutral" :tilt "tilt-left")))

    (sign :g 4 :w 10 :id "moon" :hex #x040202041 :viseme "moon"
      (kf :idx 1 :shape :claw :pos [55 -50 28] :ori :outward :nmf (nmf :brows "raised"))
      (kf :idx 2 :shape :claw :pos [70 -70 35] :ori :outward :aspect :durative :nmf (nmf :brows "raised" :tilt "tilt-right")))

    (sign :g 4 :w 11 :id "science" :hex #x040009013 :viseme "science"
      (kf :idx 1 :shape :c-shape :pos [30 -10 25] :ori :prone :nmf (nmf :brows "neutral"))
      (kf :idx 2 :shape :c-shape :pos [-30 0 25]  :ori :prone :aspect :habitual :base-shift [20 -15 10] :nmf (nmf :brows "neutral")))

    (sign :g 4 :w 12 :id "maths" :hex #x010407013 :viseme "maths"
      (kf :idx 1 :shape :flat :pos [-50 25 12] :ori :prone :nmf (nmf :brows "neutral"))
      (kf :idx 2 :shape :flat :pos [-40 20 12] :ori :prone :aspect :habitual :nmf (nmf :brows "neutral")))

    (sign :g 4 :w 13 :id "number" :hex #x070407053 :viseme "number"
      (kf :idx 1 :shape :pinch :pos [-65 -10 18] :ori :lateral :nmf (nmf :brows "neutral"))
      (kf :idx 2 :shape :pinch :pos [-55 10 18]  :ori :lateral :aspect :habitual :nmf (nmf :brows "neutral")))

    (sign :g 4 :w 14 :id "equal" :hex #x030407032 :viseme "equal"
      (kf :idx 1 :shape :point :pos [-35 0 20]  :ori :inward :hold 150 :base-shift [0 15 0] :nmf (nmf :brows "neutral"))
      (kf :idx 2 :shape :point :pos [-35 15 20] :ori :inward :aspect :intensive :hold 100 :base-shift [0 15 0] :nmf (nmf :brows "neutral")))

    (sign :g 4 :w 15 :id "big" :hex #x060001052 :viseme "big"
      (kf :idx 1 :shape :claw :pos [-10 0 25]  :ori :lateral :base-mode :mirror :nmf (nmf :brows "raised"))
      (kf :idx 2 :shape :claw :pos [75 -15 40] :ori :lateral :aspect :intensive :base-mode :mirror :nmf (nmf :mouth "huge" :brows "raised" :tilt "nod")))

    (sign :g 4 :w 16 :id "small" :hex #x070203042 :viseme "small"
      (kf :idx 1 :shape :pinch :pos [35 -35 30] :ori :outward :nmf (nmf :brows "furrowed"))
      (kf :idx 2 :shape :pinch :pos [30 -30 35] :ori :outward :aspect :intensive :nmf (nmf :mouth "tiny" :brows "furrowed" :tilt "nod")))

    (sign :g 4 :w 17 :id "slow" :hex #x010402011 :viseme "slow"
      (kf :idx 1 :shape :flat :pos [-65 35 10] :ori :prone :base-mode :vowel-board :nmf (nmf :brows "neutral"))
      (kf :idx 2 :shape :flat :pos [-30 15 16] :ori :prone :aspect :durative :base-mode :vowel-board :nmf (nmf :brows "neutral" :tilt "nod")))
  )

  ;; ===========================================================================
  ;; GROUP 05: SACRAMENTAL FAITH & THEOLOGICAL REGISTER
  ;; ===========================================================================
  (group :id 5 :label "SACRAMENTAL_FAITH"
    (sign :g 5 :w 0 :id "jesus" :hex #x030407033 :viseme "Jesus"
      (kf :idx 1 :shape :point :pos [-50 30 12] :ori :inward :nmf (nmf :brows "neutral"))
      (kf :idx 2 :shape :point :pos [35 25 14]  :ori :inward :aspect :habitual :base-shift [20 -10 0] :nmf (nmf :mouth "Christ" :brows "neutral")))

    (sign :g 5 :w 1 :id "god" :hex #x030502041 :viseme "God"
      (kf :idx 1 :shape :point :pos [25 -50 25] :ori :outward :nmf (nmf :brows "raised"))
      (kf :idx 2 :shape :point :pos [30 -85 35] :ori :outward :aspect :durative :nmf (nmf :brows "raised")))

    (sign :g 5 :w 2 :id "pray" :hex #x010307051 :viseme "pray"
      (kf :idx 1 :shape :flat :pos [-15 -15 25] :ori :lateral :nmf (nmf :brows "neutral"))
      (kf :idx 2 :shape :flat :pos [-15 5 30]   :ori :lateral :aspect :durative :nmf (nmf :mouth "Amen" :brows "neutral" :tilt "nod")))

    (sign :g 5 :w 3 :id "church" :hex #x010307053 :viseme "church"
      (kf :idx 1 :shape :flat :pos [-5 -40 22] :ori :lateral :nmf (nmf :brows "neutral"))
      (kf :idx 2 :shape :flat :pos [-5 -30 22] :ori :lateral :aspect :habitual :nmf (nmf :brows "neutral")))

    (sign :g 5 :w 4 :id "cross" :hex #x030202041 :viseme "cross"
      (kf :idx 1 :shape :point :pos [0 -60 25]   :ori :outward :base-mode :vowel-board :nmf (nmf :brows "neutral"))
      (kf :idx 2 :shape :point :pos [0 35 25]    :ori :outward :base-mode :vowel-board :nmf (nmf :brows "neutral"))
      (kf :idx 3 :shape :point :pos [-45 -15 22] :ori :outward :base-mode :vowel-board :nmf (nmf :brows "neutral"))
      (kf :idx 4 :shape :point :pos [45 -15 22]  :ori :outward :aspect :durative :base-mode :vowel-board :nmf (nmf :brows "neutral")))

    (sign :g 5 :w 5 :id "bible" :hex #x010009021 :viseme "holy"
      (kf :idx 1 :shape :flat :pos [-10 15 20] :ori :lateral :nmf (nmf :brows "neutral"))
      (kf :idx 2 :shape :flat :pos [25 20 15]  :ori :supine  :aspect :durative :base-shift [-30 0 0] :nmf (nmf :mouth "book" :brows "neutral")))

    (sign :g 5 :w 6 :id "holy" :hex #x010302021 :viseme "holy"
      (kf :idx 1 :shape :flat :pos [-10 0 20]  :ori :supine :nmf (nmf :brows "raised"))
      (kf :idx 2 :shape :flat :pos [15 -45 30] :ori :supine :aspect :durative :nmf (nmf :brows "raised")))

    (sign :g 5 :w 7 :id "love" :hex #x020307031 :viseme "love"
      (kf :idx 1 :shape :fist :pos [10 10 15]   :ori :inward :nmf (nmf :brows "neutral"))
      (kf :idx 2 :shape :fist :pos [-25 -5 22]  :ori :inward :aspect :durative :nmf (nmf :brows "neutral" :tilt "nod")))

    (sign :g 5 :w 8 :id "peace" :hex #x010001011 :viseme "peace"
      (kf :idx 1 :shape :flat :pos [-10 5 20]  :ori :prone :nmf (nmf :brows "neutral"))
      (kf :idx 2 :shape :flat :pos [55 30 20]  :ori :prone :aspect :durative :base-shift [-40 20 0] :nmf (nmf :brows "neutral")))
  )

  ;; ===========================================================================
  ;; GROUP 06: BSL LEVEL 6 MORPHOLOGICAL CLASSIFIERS & TOPOLOGY
  ;; ===========================================================================
  (group :id 6 :label "LEVEL_6_CLASSIFIERS_AND_TOPOLOGY"
    (sign :g 6 :w 0 :id "cl-entity-move" :hex #x030601041 :viseme ""
      (kf :idx 1 :shape :point :pos [-40 0 25]  :ori :outward :nmf (nmf :brows "neutral" :tilt "tilt-left"))
      (kf :idx 2 :shape :point :pos [40 -10 40] :ori :outward :aspect :durative :nmf (nmf :brows "neutral" :tilt "tilt-right")))

    (sign :g 6 :w 1 :id "cl-flat-boundary" :hex #x010003051 :viseme ""
      (kf :idx 1 :shape :flat :pos [15 0 35]   :ori :lateral :nmf (nmf :brows "neutral"))
      (kf :idx 2 :shape :flat :pos [10 -15 65] :ori :lateral :aspect :durative :nmf (nmf :brows "neutral" :tilt "nod")))

    (sign :g 6 :w 2 :id "cl-person-approach" :hex #x050706031 :viseme "mm"
      (kf :idx 1 :shape :v :pos [35 -20 60] :ori :inward :hold 120 :nmf (nmf :brows "neutral"))
      (kf :idx 2 :shape :v :pos [10 15 25]  :ori :inward :aspect :durative :hold 150 :nmf (nmf :brows "neutral" :tilt "nod")))

    (sign :g 6 :w 3 :id "cl-cylinder" :hex #x040002051 :viseme "puff"
      (kf :idx 1 :shape :c-shape :pos [0 25 25]  :ori :lateral :base-mode :mirror :nmf (nmf :brows "neutral"))
      (kf :idx 2 :shape :c-shape :pos [0 -35 28] :ori :lateral :aspect :durative :base-mode :mirror :nmf (nmf :brows "raised" :tilt "nod")))

    (sign :g 6 :w 4 :id "role-shift-left" :hex #x010609051 :viseme ""
      (kf :idx 1 :shape :flat :pos [0 15 20]   :ori :lateral :nmf (nmf :brows "neutral" :tilt "neutral"))
      (kf :idx 2 :shape :flat :pos [-20 15 20] :ori :lateral :aspect :durative :nmf (nmf :brows "raised" :tilt "tilt-left")))

    (sign :g 6 :w 5 :id "role-shift-right" :hex #x010709051 :viseme ""
      (kf :idx 1 :shape :flat :pos [0 15 20]  :ori :lateral :nmf (nmf :brows "neutral" :tilt "neutral"))
      (kf :idx 2 :shape :flat :pos [20 15 20] :ori :lateral :aspect :durative :nmf (nmf :brows "raised" :tilt "tilt-right")))

    (sign :g 6 :w 6 :id "topic-mark" :hex #x010003021 :viseme ""
      (kf :idx 1 :shape :flat :pos [20 5 30]  :ori :supine :hold 250 :base-mode :mirror :nmf (nmf :brows "raised"))
      (kf :idx 2 :shape :flat :pos [20 18 32] :ori :supine :aspect :durative :hold 100 :base-mode :mirror :nmf (nmf :brows "neutral" :tilt "nod")))

    (sign :g 6 :w 7 :id "buoy-pointer" :hex #x030600031 :viseme ""
      (kf :idx 1 :shape :point :pos [-40 10 25] :ori :inward :hold 400 :nmf (nmf :brows "neutral"))
      (kf :idx 2 :shape :point :pos [-40 10 25] :ori :inward :aspect :durative :hold 400 :nmf (nmf :brows "neutral")))

    (sign :g 6 :w 8 :id "not-like" :hex #x010301012 :viseme "not"
      (kf :idx 1 :shape :flat :pos [-10 -5 20] :ori :inward :hold 100 :nmf (nmf :mouth "like" :brows "furrowed"))
      (kf :idx 2 :shape :flat :pos [35 15 35]  :ori :prone  :aspect :intensive :hold 180 :nmf (nmf :brows "furrowed" :tilt "shake")))
  )
)
