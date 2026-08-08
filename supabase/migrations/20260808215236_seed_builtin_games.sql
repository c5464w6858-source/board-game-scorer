insert into games (slug, name, is_builtin, theme, categories, scoring_rules) values
(
  'ticket-to-ride',
  'Ticket to Ride',
  true,
  '{"primary":"#0e4f8f","accent":"#f2b134","bg":"#eef5fb","text":"#0b2e52","icon":"train"}',
  '[
    {"key":"route","label":"Route claimed","type":"table","weight":1,"repeatable":true,
     "options":[
       {"label":"1 car (1 pt)","value":1},
       {"label":"2 cars (2 pts)","value":2},
       {"label":"3 cars (4 pts)","value":4},
       {"label":"4 cars (7 pts)","value":7},
       {"label":"5 cars (10 pts)","value":10},
       {"label":"6 cars (15 pts)","value":15}
     ],
     "helpText":"Add one entry per route you claim"},
    {"key":"destination_ticket","label":"Destination ticket","type":"number","weight":1,"repeatable":true,
     "helpText":"Positive if completed, negative if not"},
    {"key":"longest_path","label":"Longest continuous path","type":"checkbox","weight":10}
  ]',
  '{"mode":"weighted_sum"}'
),
(
  'catan',
  'Catan',
  true,
  '{"primary":"#8a5a2c","accent":"#e0a63e","bg":"#fbf3e6","text":"#4a2f14","icon":"hexagon"}',
  '[
    {"key":"settlements","label":"Settlements","type":"counter","weight":1,"min":0,"max":5},
    {"key":"cities","label":"Cities","type":"counter","weight":2,"min":0,"max":4},
    {"key":"dev_card_vp","label":"Victory point cards","type":"counter","weight":1},
    {"key":"longest_road","label":"Longest road","type":"checkbox","weight":2},
    {"key":"largest_army","label":"Largest army","type":"checkbox","weight":2}
  ]',
  '{"mode":"weighted_sum"}'
),
(
  'wingspan',
  'Wingspan',
  true,
  '{"primary":"#2f6d4f","accent":"#9fc98a","bg":"#eef7ef","text":"#1c3d2b","icon":"feather"}',
  '[
    {"key":"bird_points","label":"Bird points","type":"number","weight":1},
    {"key":"bonus_cards","label":"Bonus cards","type":"number","weight":1},
    {"key":"end_round_goals","label":"End-of-round goals","type":"number","weight":1},
    {"key":"eggs","label":"Eggs","type":"counter","weight":1},
    {"key":"cached_food","label":"Food cached on cards","type":"counter","weight":1},
    {"key":"tucked_cards","label":"Tucked cards","type":"counter","weight":1}
  ]',
  '{"mode":"weighted_sum"}'
),
(
  'splendor',
  'Splendor',
  true,
  '{"primary":"#7c1fa2","accent":"#2fb6a8","bg":"#f5eefb","text":"#3a0a4f","icon":"gem"}',
  '[
    {"key":"card_points","label":"Development card points","type":"number","weight":1},
    {"key":"nobles","label":"Nobles visited","type":"counter","weight":3}
  ]',
  '{"mode":"weighted_sum"}'
),
(
  'generic',
  'Generic Scoring',
  true,
  '{"primary":"#475569","accent":"#6366f1","bg":"#f1f5f9","text":"#1e293b","icon":"dice"}',
  '[
    {"key":"round","label":"Round score","type":"number","weight":1,"repeatable":true,
     "helpText":"Add one entry per round"}
  ]',
  '{"mode":"weighted_sum"}'
)
on conflict (slug) do nothing;
