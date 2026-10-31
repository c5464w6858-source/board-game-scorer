import React, { useState, useMemo, useEffect, useRef } from "react";

// ─── Google Fonts ─────────────────────────────────────────────────────────────
const FONT_LINK = document.createElement("link");
FONT_LINK.rel = "stylesheet";
FONT_LINK.href = "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Hanken+Grotesk:wght@400;500;600;700;800&display=swap";
document.head.appendChild(FONT_LINK);

// ─── Design tokens ───────────────────────────────────────────────────────────
const C = {
  brand:    "#0F6B5C",  // deep confident teal — calm, trustworthy, care
  brandDk:  "#0A5044",
  brandMd:  "#2E8C7B",
  brandLt:  "#E4F0ED",  // pale teal wash
  hero:     "#F6F4EE",  // warm stone paper
  accent:   "#DD6240",  // warm terracotta — energy for highlights
  green:    "#2E8B6F",
  amber:    "#BD7A1C",
  red:      "#C0432D",
  // warm-neutral ramp (keys preserved; values re-tuned to a warm paper scale)
  slate50:  "#F7F6F2",
  slate100: "#EEEBE3",
  slate200: "#E1DDD3",
  slate300: "#C9C3B6",
  slate400: "#948D7E",
  slate500: "#6E685B",
  slate600: "#514B40",
  slate700: "#3A352C",
  slate800: "#26221C",
  slate900: "#1A1712",  // warm near-black ink
  white:    "#FFFFFF",
  // Tab section backgrounds — unified calm paper
  actBg:  "#F6F4EE",
  therBg: "#F4F5F1",
  charBg: "#F5F3EF",
};
const F = { display: "'Fraunces', Georgia, serif", body: "'Hanken Grotesk', system-ui, sans-serif" };
const SHADOW = {
  sm:  "0 1px 2px rgba(40,33,22,0.05), 0 1px 1px rgba(40,33,22,0.04)",
  md:  "0 4px 16px rgba(40,33,22,0.06), 0 2px 6px rgba(40,33,22,0.04)",
  lg:  "0 16px 40px rgba(40,33,22,0.10), 0 6px 14px rgba(40,33,22,0.05)",
  xl:  "0 32px 70px rgba(40,33,22,0.14), 0 10px 24px rgba(40,33,22,0.07)",
  brand: "0 8px 22px rgba(15,107,92,0.26)",
};

// ─── Seed data ────────────────────────────────────────────────────────────────
const SEED = [
  // ─── SURREY (existing) ────────────────────────────────────────────────────
  { id:"surrey-1", name:"LinkAble Play Sessions", organisation:"LinkAble Woking", type:"Sensory", location:"Woking", postcode:"GU21 5HE", lat:51.3183, lng:-0.5585, description:"Fun inclusive play sessions at LinkAble's fully accessible centre for children with learning disabilities and autism. Features a large sensory room, soft play, outdoor climbing frames and musical instruments. Website: linkable.org.uk", ageMin:5, ageMax:12, accessibility:["Wheelchair accessible","Sensory room","Quiet space","Step-free access","Visual timetables"], support:"1:2 (staff to child)", needs:["Autism","Learning disability","Down's syndrome","Global development delay","Communication difficulties"], cost:"Contact for pricing", funding:["Short Breaks funded","Charity grants available","EHCP funded"], days:["Saturday"], time:"09:30 – 15:30", contactName:"LinkAble Team", contactEmail:"info@linkable.org.uk", contactPhone:"01483 770037", website:"https://www.linkable.org.uk/pages/Play", factChecked:true, ownerId:"seed" },
  { id:"surrey-2", name:"Challengers Guildford Play Scheme", organisation:"Disability Challengers", type:"Social Skills", location:"Guildford", postcode:"GU1 1TU", lat:51.2395, lng:-0.5703, description:"Award-winning play scheme for disabled children aged 4–18 in Stoke Park. Arts, crafts, cooking, karaoke, sports and farm visits with specialist trained staff. Non-exclusion policy. Website: disability-challengers.org", ageMin:4, ageMax:18, accessibility:["Wheelchair accessible","Step-free access","Changing Places toilet","Quiet space","Visual timetables","Sensory room"], support:"1:1 (staff to child)", needs:["Autism","Physical disability","Learning disability","Cerebral palsy","ADHD","Sensory processing","Global development delay","Communication difficulties"], cost:"£37 per day", funding:["Short Breaks funded","EHCP funded","Charity grants available"], days:["Saturday","Sunday"], time:"09:30 – 16:00", contactName:"Play & Leisure Team", contactEmail:"PlayandLeisureTeam@disability-challengers.org", contactPhone:"01483 579390", website:"https://disability-challengers.org/play/", factChecked:true, ownerId:"seed" },
  { id:"surrey-3", name:"White Lodge Holiday Club", organisation:"White Lodge Centre", type:"Social Skills", location:"Chertsey", postcode:"KT16 0FA", lat:51.3865, lng:-0.5065, description:"Holiday clubs for disabled children aged 4–12 across Runnymede, Spelthorne and Elmbridge. Arts, baking, swimming and trips. Specialist physio, OT and speech therapy staff on a two-acre accessible site. Website: whitelodgecentre.co.uk", ageMin:4, ageMax:12, accessibility:["Wheelchair accessible","Hoist available","Changing Places toilet","Hydrotherapy pool","Sensory room","Step-free access"], support:"1:1 (staff to child)", needs:["Cerebral palsy","Physical disability","Autism","Learning disability","Global development delay","Communication difficulties","Down's syndrome"], cost:"Contact for pricing", funding:["Short Breaks funded","EHCP funded","Charity grants available"], days:["Monday","Tuesday","Wednesday","Thursday","Friday"], time:"School holidays — see website", contactName:"White Lodge Centre", contactEmail:"info@whitelodgecentre.co.uk", contactPhone:"01932 567131", website:"https://www.whitelodgecentre.co.uk/what-we-do/children-and-young-people/play-and-youth-clubs/holiday-clubs", factChecked:true, ownerId:"seed" },
  { id:"surrey-4", name:"SAMBER RDA Horse Riding", organisation:"SAMBER RDA Group", type:"Animal Therapy", location:"Chobham", postcode:"GU24 8SL", lat:51.3527, lng:-0.5985, description:"Therapeutic horse riding at Higher Park Farm, Chobham for children with special needs. Children receive physical and psychological benefits of equine therapy supported by trained volunteers. Website: samber-rda.org.uk", ageMin:3, ageMax:18, accessibility:["Mounting ramp","Step-free access","Quiet approach route"], support:"1:1 (staff to child)", needs:["Cerebral palsy","Physical disability","Autism","Learning disability","Anxiety","Sensory processing"], cost:"Contact for pricing", funding:["Charity grants available","EHCP funded"], days:["Tuesday","Thursday"], time:"Term time — contact for times", contactName:"SAMBER RDA", contactEmail:"contact@samber-rda.org.uk", contactPhone:"0300 201 0030", website:"https://www.samber-rda.org.uk", factChecked:true, ownerId:"seed" },
  { id:"surrey-5", name:"Head2Head Sensory Theatre", organisation:"Head2Head Sensory Theatre", type:"Drama", location:"Oxted", postcode:"RH8 9NT", lat:51.2571, lng:0.0078, description:"Multi-sensory theatre shows for children with SEN, autism and disabilities. Makaton-trained actors deliver immersive experiences including sensory pantomimes and interactive workshops for PMLD, ASD, visual and hearing impairments. Website: h2hsensorytheatre.com", ageMin:0, ageMax:25, accessibility:["Wheelchair accessible","Step-free access","Sensory room","Quiet space","Visual timetables","Ear defenders available","BSL interpreter"], support:"Varies by need", needs:["Autism","Visual impairment","Hearing impairment","Learning disability","Physical disability","Sensory processing","Global development delay","Communication difficulties"], cost:"£5 per child", funding:["Self-pay","Charity grants available"], days:["Saturday","Sunday"], time:"Various — see website", contactName:"Head2Head Team", contactEmail:"reception@h2hsensorytheatre.com", contactPhone:"01883 725264", website:"https://h2hsensorytheatre.com", factChecked:true, ownerId:"seed" },
  { id:"surrey-6", name:"NAS Autism Youth Club Godalming", organisation:"National Autistic Society Surrey Branch", type:"Social Skills", location:"Godalming", postcode:"GU7 1HR", lat:51.1860, lng:-0.6146, description:"Structured autism-friendly youth club for autistic young people aged 11–18. A safe environment with fun activities helping develop communication, social skills and confidence. No formal diagnosis required. Website: nassurreybranch.org", ageMin:11, ageMax:18, accessibility:["Step-free access","Low-arousal environment","Visual timetables","Quiet space"], support:"1:3 (staff to child)", needs:["Autism","ADHD","Anxiety","Communication difficulties","Sensory processing"], cost:"£5 per session (£2.50 concession)", funding:["Self-pay","Short Breaks funded"], days:["Tuesday"], time:"19:00 – 21:00 (term time)", contactName:"NAS Surrey Family Support", contactEmail:"surrey.familysupport@nas.org.uk", contactPhone:"01483 521743", website:"https://nassurreybranch.org/nas-clubs-for-children/", factChecked:true, ownerId:"seed" },
  { id:"surrey-7", name:"SENDsory Play Sessions", organisation:"Guildford Nursery School and Family Centre", type:"Sensory", location:"Guildford", postcode:"GU1 1NR", lat:51.2520, lng:-0.5735, description:"Free weekly sensory play for children with additional needs aged 0–5 at Bellfields Family Centre. Professionals from Early Support, SEES and physiotherapists attend. No diagnosis needed. Website: surreycc.gov.uk", ageMin:0, ageMax:5, accessibility:["Wheelchair accessible","Sensory room","Step-free access","Visual timetables"], support:"1:2 (staff to child)", needs:["Autism","Sensory processing","Global development delay","Physical disability","Communication difficulties"], cost:"Free", funding:["Fully funded"], days:["Monday"], time:"10:00 – 11:30", contactName:"Guildford Nursery School and Family Centre", contactEmail:"receptionfc@guildfordnscc.surrey.sch.uk", contactPhone:"01483 510570", website:"https://www.surreycc.gov.uk/children/support-and-advice/families/directory/s/sendsory-play", factChecked:true, ownerId:"seed" },
  { id:"surrey-8", name:"Wheels for All Inclusive Cycling", organisation:"Surrey Wheels for All", type:"Sports", location:"Epsom", postcode:"KT19 9RY", lat:51.3372, lng:-0.2667, description:"Inclusive cycling at Harriers Athletics Track using adapted bikes including trikes, quads and handcycles for all abilities. Fun, safe environment with trained staff and volunteers. No experience needed. Website: wheelsforall.org.uk", ageMin:3, ageMax:99, accessibility:["Wheelchair accessible","Step-free access"], support:"1:2 (staff to child)", needs:["Physical disability","Cerebral palsy","Autism","Learning disability","Visual impairment","Down's syndrome"], cost:"Free", funding:["Fully funded"], days:["Thursday","Saturday"], time:"Thu 15:15–17:15 · Sat 13:30–16:00", contactName:"Wheels for All Surrey", contactEmail:"Contact via website", contactPhone:"Contact via website", website:"https://wheelsforall.org.uk/locations/epsom-ewell-wheels-for-all", factChecked:true, ownerId:"seed" },
  { id:"surrey-9", name:"Rainbow Leisure SEN Play Park", organisation:"Places Leisure Rainbow Centre", type:"Sensory", location:"Epsom", postcode:"KT17 1BN", lat:51.3356, lng:-0.2637, description:"Dedicated SEN play park sessions at Rainbow Leisure Centre for children 0–10 with special needs. Lower lighting, no music and reduced capacity for a calm environment. Two-tier structure, soft play and under-3s area. Website: placesleisure.org", ageMin:0, ageMax:10, accessibility:["Wheelchair accessible","Step-free access","Low-arousal environment","Quiet space"], support:"Varies by need", needs:["Autism","Sensory processing","Physical disability","Global development delay","ADHD","Learning disability"], cost:"Contact for pricing", funding:["Self-pay","DLA accepted"], days:["Thursday"], time:"15:45 – 17:15", contactName:"Rainbow Leisure Centre", contactEmail:"rainbow@placesleisure.org", contactPhone:"01372 742000", website:"https://www.placesleisure.org/centres/rainbow-leisure-centre/", factChecked:true, ownerId:"seed" },
  { id:"surrey-10", name:"Yippee Disability Play Club Reigate", organisation:"YMCA East Surrey", type:"Social Skills", location:"Reigate", postcode:"RH2 8HA", lat:51.2333, lng:-0.2013, description:"Welcoming play club for disabled children aged 5–11 at YMCA Sovereign Centre. Makaton-trained staff lead activities. Every child included including those needing 1:1 support. Short breaks funding accepted. Website: ymcaeastsurrey.org.uk", ageMin:5, ageMax:11, accessibility:["Wheelchair accessible","Step-free access","Quiet space","Visual timetables"], support:"1:1 (staff to child)", needs:["Autism","Physical disability","Learning disability","ADHD","Cerebral palsy","Down's syndrome","Communication difficulties"], cost:"£30 per day", funding:["Short Breaks funded","EHCP funded","Bursary available"], days:["Saturday"], time:"Weekends and school holidays", contactName:"YMCA Short Breaks Team", contactEmail:"Charlotte.Payne@ymcaeastsurrey.org.uk", contactPhone:"01737 222859", website:"https://www.ymcaeastsurrey.org.uk/services/cyp/disability-services/yippee/", factChecked:true, ownerId:"seed" },
  { id:"surrey-11", name:"Inclusive Sports Taster Sessions", organisation:"Skillz4Life", type:"Sports", location:"Ashtead", postcode:"KT21 2PX", lat:51.3086, lng:-0.2982, description:"Free multi-sport camp every Saturday for children with additional needs and disabilities, Reception to Year 6, of all abilities — football, basketball, gymnastics, dance, tennis, archery, arts and crafts at West Ashtead Primary School. Website: surreycc.gov.uk", ageMin:4, ageMax:12, accessibility:["Step-free access","Visual timetables","Quiet space"], support:"1:4 (staff to child)", needs:["Autism","ADHD","Physical disability","Learning disability","Anxiety","Sensory processing"], cost:"Free", funding:["Short Breaks funded","Charity grants available"], days:["Saturday"], time:"09:00 – 13:00", contactName:"Skillz4Life", contactEmail:"michal@skillz4life-sportscoaching.co.uk", contactPhone:"07402 550606", website:"https://www.surreycc.gov.uk/children/support-and-advice/families/directory/s/skillz4life-send-multi-sports-camp", factChecked:true, ownerId:"seed" },


  // ─── SURREY (continued) ──────────────────────────────────────────────────
  { id:"surrey-12", name:"Challengers Farnham Youth Scheme", organisation:"Disability Challengers", type:"Social Skills", location:"Farnham", postcode:"GU9 9QF", lat:51.2099, lng:-0.7981, description:"Inclusive youth sessions for disabled young people aged 13–18 in Farnham. Activities include music workshops, baking, sports and day trips. Flexible support levels tailored to each young person. Website: disability-challengers.org", ageMin:13, ageMax:18, accessibility:["Wheelchair accessible","Step-free access","Quiet space"], support:"1:1 (staff to child)", needs:["Autism","Physical disability","Learning disability","ADHD","Anxiety","Communication difficulties"], cost:"£37 per day", funding:["Short Breaks funded","EHCP funded"], days:["Saturday"], time:"10:00 – 16:00", contactName:"Play & Leisure Team", contactEmail:"PlayandLeisureTeam@disability-challengers.org", contactPhone:"01483 579390", website:"https://disability-challengers.org/youth/", factChecked:true, ownerId:"seed" },
  { id:"surrey-13", name:"Godstone RDA Horse Riding", organisation:"Godstone Riding for Disabled Association", type:"Animal Therapy", location:"Oxted", postcode:"RH8 9NE", lat:51.2588, lng:0.0043, description:"Weekly riding lessons during term time for children with disabilities at Tandridge Priory Riding Centre. Part of the national RDA network, delivering therapeutic riding for physical and emotional wellbeing. Website: rda.org.uk", ageMin:5, ageMax:18, accessibility:["Mounting ramp","Step-free access","Quiet approach route"], support:"1:1 (staff to child)", needs:["Physical disability","Cerebral palsy","Autism","Learning disability","Anxiety"], cost:"Contact for pricing", funding:["Charity grants available"], days:["Tuesday","Wednesday"], time:"Term time — contact for schedule", contactName:"RDA Coordinator", contactEmail:"wendy.1965@yahoo.co.uk", contactPhone:"07884 262531", website:"https://www.rda.org.uk", factChecked:false, ownerId:"seed" },
  { id:"surrey-14", name:"Project Purple Inclusive Drama Club", organisation:"Peer Productions", type:"Drama", location:"Woking", postcode:"GU21 6JD", lat:51.3230, lng:-0.5520, description:"Inclusive drama programme for young people with and without learning disabilities, run periodically by Peer Productions (a Surrey youth theatre charity based at The Ypod Centre, Woking). Its 2024 pilot worked with ages 13–18 over a 10-week block; Peer Productions describes future runs as 'under development'. Contact them to check current availability, age range and schedule before attending. Website: peerproductions.co.uk", ageMin:13, ageMax:18, accessibility:["Step-free access","Visual timetables","Low-arousal environment"], support:"1:3 (staff to child)", needs:["Learning disability","Autism","ADHD","Anxiety","Communication difficulties"], cost:"Contact for pricing", funding:["Short Breaks funded","Charity grants available"], days:["Wednesday","Friday"], time:"Contact for current schedule — runs periodically, not weekly year-round", contactName:"Peer Productions", contactEmail:"admin@peerproductions.co.uk", contactPhone:"01483 921473", website:"https://www.peerproductions.co.uk/project-purple", factChecked:false, ownerId:"seed" },
  { id:"surrey-15", name:"Accessible Swimming — Farnham Leisure", organisation:"Everyone Active Farnham Leisure Centre", type:"Swimming", location:"Farnham", postcode:"GU9 7UD", lat:51.2120, lng:-0.7993, description:"Assisted and inclusive swimming at Farnham Leisure Centre for disabled children with additional needs. Qualified instructors and accessible changing facilities. Taster sessions bookable. Website: everyoneactive.com", ageMin:3, ageMax:18, accessibility:["Wheelchair accessible","Step-free access"], support:"1:2 (staff to child)", needs:["Physical disability","Autism","Sensory processing","Cerebral palsy","Learning disability"], cost:"Contact for pricing", funding:["DLA accepted","Self-pay"], days:["Monday","Wednesday","Saturday"], time:"Various — contact centre", contactName:"Farnham Leisure Centre", contactEmail:"farnham@everyoneactive.com", contactPhone:"01252 727851", website:"https://www.everyoneactive.com/centre/farnham-leisure-centre/", factChecked:false, ownerId:"seed" },
  { id:"surrey-16", name:"Yip4Youth Disability Club Reigate", organisation:"YMCA East Surrey", type:"Social Skills", location:"Reigate", postcode:"RH2 8HA", lat:51.2333, lng:-0.2013, description:"Fun and friendly youth club for disabled young people aged 12–17 at YMCA Sovereign Centre. Youth-led activities, qualified staff. Yip4Youth+ also available for young people needing higher levels of support. Website: ymcaeastsurrey.org.uk", ageMin:12, ageMax:17, accessibility:["Wheelchair accessible","Step-free access","Quiet space"], support:"1:1 (staff to child)", needs:["Autism","Physical disability","Learning disability","ADHD","Cerebral palsy","Down's syndrome","Anxiety"], cost:"£33 per day", funding:["Short Breaks funded","EHCP funded","Bursary available"], days:["Saturday"], time:"10:30 – 16:30 (also school holidays)", contactName:"YMCA Short Breaks Team", contactEmail:"sovereign@ymcaeastsurrey.org.uk", contactPhone:"01737 222859", website:"https://www.ymcaeastsurrey.org.uk/children/disability-activities/short-breaks-12-18/reigate-banstead/", factChecked:true, ownerId:"seed" },
  { id:"surrey-17", name:"Yippee & Yip4Youth — Leatherhead", organisation:"YMCA East Surrey", type:"Social Skills", location:"Leatherhead", postcode:"KT22 7ER", lat:51.2951, lng:-0.3303, description:"YMCA East Surrey's play and youth schemes for disabled children aged 5–17 in Leatherhead, run in partnership with Surrey County Council. Saturdays and school holidays. 1:1 support included where needed. Website: ymcaeastsurrey.org.uk", ageMin:5, ageMax:17, accessibility:["Wheelchair accessible","Step-free access","Visual timetables","Quiet space"], support:"1:1 (staff to child)", needs:["Autism","Learning disability","Physical disability","ADHD","Communication difficulties","Down's syndrome"], cost:"£30–£33 per day", funding:["Short Breaks funded","EHCP funded","Bursary available"], days:["Saturday"], time:"Saturdays and school holidays", contactName:"Miriam Casal", contactEmail:"Miriam.Casal@ymcaeastsurrey.org.uk", contactPhone:"01737 222859", website:"https://www.ymcaeastsurrey.org.uk/children/disability-activities/short-breaks-12-18/yip4youth-leatherhead/", factChecked:true, ownerId:"seed" },
  { id:"surrey-18", name:"SEND Play and Learn — Camberley", organisation:"Surrey Heath Family Centre (Barnardo's)", type:"Sensory", location:"Camberley", postcode:"GU15 4AF", lat:51.3361, lng:-0.7436, description:"Free sensory play and learning sessions for SEND children aged 0–5 in Camberley run by Barnardo's at Surrey Heath Family Centre. No diagnosis required. Siblings welcome. Professionals on hand for family advice. Website: surreycc.gov.uk", ageMin:0, ageMax:5, accessibility:["Wheelchair accessible","Sensory room","Step-free access"], support:"1:2 (staff to child)", needs:["Autism","Sensory processing","Global development delay","Communication difficulties","Learning disability"], cost:"Free", funding:["Fully funded"], days:["Thursday"], time:"09:30 – 10:30", contactName:"Surrey Heath Family Centre", contactEmail:"surreyheathfamilycentre@barnados.org.uk", contactPhone:"01276 462897", website:"https://www.surreycc.gov.uk/community/news/categories/families-and-young-people/additional-needs-summer-activities", factChecked:true, ownerId:"seed" },
  { id:"surrey-19", name:"Little Portesberries Stay & Play", organisation:"Portesbery School", type:"Sensory", location:"Mytchett", postcode:"GU16 6AA", lat:51.3047, lng:-0.6710, description:"Stay and play sessions for families with children aged 0–5 with additional needs, run by Portesbery School staff at The Mytchett Centre. Siblings aged 11 and under welcome. No diagnosis required. Fun activities including messy play, sensory and an attention autism session. Website: portesbery.surrey.sch.uk", ageMin:0, ageMax:5, accessibility:["Wheelchair accessible","Sensory room","Quiet space","Step-free access"], support:"1:2 (staff to child)", needs:["Autism","Global development delay","Sensory processing","Physical disability","Communication difficulties","Learning disability"], cost:"Free (£2 donation appreciated)", funding:["Fully funded"], days:["Friday"], time:"10:00 – 12:00 (term time only)", contactName:"Portesbery School", contactEmail:"info@portesbery.surrey.sch.uk", contactPhone:"01252 832100", website:"https://www.portesbery.surrey.sch.uk/Little-Portesberries/", factChecked:true, ownerId:"seed" },
  { id:"surrey-20", name:"Play and Learn Plus — Woking", organisation:"Woking Family Centre (Barnardo's)", type:"Sensory", location:"Woking", postcode:"GU21 5NZ", lat:51.3270, lng:-0.5550, description:"Free sensory play and learning sessions for SEND children aged 0–5 in Woking, pre and post diagnosis. Siblings welcome. Fun activities and sensory resources with family support available. Woking's family centre service is run by Barnardo's across more than one site — confirm venue when booking. Website: surreycc.gov.uk", ageMin:0, ageMax:5, accessibility:["Wheelchair accessible","Sensory room","Step-free access","Quiet space"], support:"1:2 (staff to child)", needs:["Autism","Sensory processing","Global development delay","Communication difficulties"], cost:"Free", funding:["Fully funded"], days:["Tuesday"], time:"Contact centre for current times", contactName:"Woking Family Centre (Barnardo's)", contactEmail:"wokingfamilycentre@barnardos.org.uk", contactPhone:"01483 743941", website:"https://www.surreycc.gov.uk/children/support-and-advice/local-offer/parents-and-carers/support-for-children-in-early-years/support-services-available-throughout-surrey", factChecked:true, ownerId:"seed" },
  { id:"surrey-21", name:"White Lodge Hydrotherapy Pool", organisation:"White Lodge Centre", type:"Swimming", location:"Chertsey", postcode:"KT16 0FA", lat:51.3870, lng:-0.5062, description:"Specialist hydrotherapy for children with physical and learning disabilities at White Lodge's on-site pool. Warm water and gentle movement supports wellbeing, especially for children with cerebral palsy. Referral via physiotherapist. Website: whitelodgecentre.co.uk", ageMin:0, ageMax:18, accessibility:["Wheelchair accessible","Hoist available","Changing Places toilet","Hydrotherapy pool","Step-free access"], support:"1:1 (staff to child)", needs:["Cerebral palsy","Physical disability","Global development delay","Learning disability","Autism"], cost:"Contact for pricing", funding:["EHCP funded","Short Breaks funded","Charity grants available"], days:["Monday","Tuesday","Wednesday","Thursday","Friday"], time:"By appointment", contactName:"White Lodge Therapy Team", contactEmail:"info@whitelodgecentre.co.uk", contactPhone:"01932 567131", website:"https://www.whitelodgecentre.co.uk/what-we-do/early-years/child-therapy", factChecked:true, ownerId:"seed" },
  { id:"surrey-22", name:"NAS Surrey Family Fun Days", organisation:"National Autistic Society Surrey Branch", type:"Social Skills", location:"Guildford", postcode:"GU7 1HR", lat:51.1862, lng:-0.6143, description:"Regular family fun days and outings for autistic children and their siblings. Activities include indoor climbing, ice skating and seasonal events. Open to families across Surrey. Website: nassurreybranch.org", ageMin:4, ageMax:18, accessibility:["Quiet space","Low-arousal environment","Visual timetables"], support:"Varies by need", needs:["Autism","ADHD","Anxiety","Communication difficulties","Sensory processing"], cost:"£4–£10 per event", funding:["Self-pay"], days:["Saturday","Sunday"], time:"Varies by event — see website", contactName:"NAS Surrey Branch", contactEmail:"support@nassurreybranch.org", contactPhone:"01483 521743", website:"https://nassurreybranch.org", factChecked:true, ownerId:"seed" },
  { id:"surrey-23", name:"Yippee Disability Play Club — Epsom", organisation:"YMCA East Surrey", type:"Social Skills", location:"Epsom", postcode:"KT17 1BN", lat:51.3356, lng:-0.2637, description:"YMCA East Surrey's welcoming play club for disabled children aged 5–11 in Epsom. All staff trained in Makaton. Activities are child-led and varied. 1:1 support available. Website: ymcaeastsurrey.org.uk", ageMin:5, ageMax:11, accessibility:["Wheelchair accessible","Step-free access","Quiet space","Visual timetables"], support:"1:1 (staff to child)", needs:["Autism","Physical disability","Learning disability","ADHD","Communication difficulties","Down's syndrome"], cost:"£30 per day", funding:["Short Breaks funded","EHCP funded","Bursary available"], days:["Saturday"], time:"Weekends and school holidays", contactName:"YMCA Short Breaks Team", contactEmail:"disabilityenquiries@ymcaeastsurrey.org.uk", contactPhone:"01737 222859", website:"https://ymcaeastsurrey.org.uk/our-services/disability", factChecked:true, ownerId:"seed" },
  { id:"surrey-24", name:"LinkAble Next Steps Youth Group", organisation:"LinkAble Woking", type:"Social Skills", location:"Woking", postcode:"GU21 5HE", lat:51.3183, lng:-0.5585, description:"Youth programme for young people aged 12–18 with learning disabilities and autism, helping them navigate the journey to adulthood. Fun new things, friendships, life skills and independence building. Website: linkable.org.uk", ageMin:12, ageMax:18, accessibility:["Wheelchair accessible","Sensory room","Quiet space","Step-free access","Visual timetables"], support:"1:2 (staff to child)", needs:["Autism","Learning disability","Down's syndrome","ADHD","Communication difficulties","Anxiety"], cost:"Contact for pricing", funding:["Short Breaks funded","EHCP funded"], days:["Saturday","Sunday"], time:"Weekends and school holidays", contactName:"LinkAble Team", contactEmail:"info@linkable.org.uk", contactPhone:"01483 770037", website:"https://www.linkable.org.uk/pages/services", factChecked:true, ownerId:"seed" },
  { id:"surrey-25", name:"LinkAble Inclusive Games", organisation:"LinkAble Woking", type:"Sports", location:"Woking", postcode:"GU22 0AF", lat:51.3168, lng:-0.5530, description:"Annual inclusive sports day at Woking Sportsbox. Boccia, Table Cricket and adapted cycling with Wheels for All. Open to all ages and abilities. Carers go free. Website: linkable.org.uk", ageMin:5, ageMax:99, accessibility:["Wheelchair accessible","Step-free access","Low-arousal environment","Quiet space"], support:"Varies by need", needs:["Autism","Physical disability","Learning disability","Down's syndrome","Cerebral palsy"], cost:"£8 early bird (carers free)", funding:["Self-pay"], days:["Tuesday"], time:"10:30 – 16:00 (annual — August)", contactName:"LinkAble Team", contactEmail:"info@linkable.org.uk", contactPhone:"01483 770037", website:"https://www.linkable.org.uk/events/inclusive-games-25", factChecked:true, ownerId:"seed" },

  // ─── LONDON ───────────────────────────────────────────────────────────────
  { id:"lon-1", name:"Disability Swimming Club", organisation:"BeyondAutism", type:"Swimming", location:"London", postcode:"SE1 7PB", lat:51.5045, lng:-0.0865, description:"Fun swimming lessons for disabled children of all abilities in a safe, supportive environment. Sessions for children with physical impairments, sensory impairments or learning disabilities. Qualified and friendly instructors throughout. Website: beyondautism.org.uk", ageMin:4, ageMax:18, accessibility:["Wheelchair accessible","Hoist available","Step-free access","Changing Places toilet"], support:"1:2 (staff to child)", needs:["Autism","Physical disability","Learning disability","Sensory processing","Cerebral palsy"], cost:"Contact for pricing", funding:["Short Breaks funded","EHCP funded"], days:["Saturday","Sunday"], time:"Various — see website", contactName:"BeyondAutism Team", contactEmail:"info@beyondautism.org.uk", contactPhone:"020 3031 9705", website:"https://www.beyondautism.org.uk/about-autism/services/disability-swimming-club/", factChecked:true, ownerId:"seed" },
  { id:"lon-2", name:"Heart 'n' Soul Creative Sessions", organisation:"Heart 'n' Soul", type:"Arts & Crafts", location:"London", postcode:"SE10 8HJ", lat:51.4796, lng:0.0092, description:"Free creative sessions for people aged 10–25 with learning disabilities or autism at the Albany, Deptford. Music, art, performance and theatre projects led by artists with learning disabilities. One of the UK's leading inclusive arts organisations. Website: heartnsoul.co.uk", ageMin:10, ageMax:25, accessibility:["Wheelchair accessible","Step-free access","Low-arousal environment","Visual timetables"], support:"1:3 (staff to child)", needs:["Learning disability","Autism","Down's syndrome","Communication difficulties","Sensory processing"], cost:"Free", funding:["Fully funded","Charity grants available"], days:["Saturday"], time:"Various — see website", contactName:"Heart 'n' Soul", contactEmail:"info@heartnsoul.co.uk", contactPhone:"020 8694 1632", website:"https://www.heartnsoul.co.uk", factChecked:true, ownerId:"seed" },
  { id:"lon-3", name:"Angel Swim Autism & SEN Lessons", organisation:"Angel Swim London", type:"Swimming", location:"London", postcode:"N1 2TR", lat:51.5351, lng:-0.1003, description:"Autism Swim certified instructors offering swimming lessons for children with disabilities including cerebral palsy, dyspraxia, epilepsy, hemiplegia and autism. Entire team trained to internationally recognised Autism Swim standard. Website: angelswim.london", ageMin:3, ageMax:18, accessibility:["Step-free access","Quiet space","Low-arousal environment"], support:"1:1 (staff to child)", needs:["Autism","Cerebral palsy","Physical disability","Sensory processing","ADHD","Anxiety","Communication difficulties"], cost:"Contact for pricing", funding:["Self-pay","DLA accepted"], days:["Saturday","Sunday"], time:"Various — book online", contactName:"Adam Knight", contactEmail:"info@angelswim.london", contactPhone:"Contact via website", website:"https://angelswim.london/autism-sen", factChecked:true, ownerId:"seed" },
  { id:"lon-4", name:"Kids Can Achieve Play Schemes", organisation:"Kids Can Achieve", type:"Social Skills", location:"Harrow", postcode:"HA1 3AB", lat:51.5797, lng:-0.3344, description:"Play and youth activities for disabled children aged 5+ in Pinner and Harrow including holiday play schemes, after school and Saturday clubs. All staff trained in supporting additional needs. Website: kidscanachieve.co.uk", ageMin:5, ageMax:18, accessibility:["Wheelchair accessible","Step-free access","Visual timetables","Quiet space"], support:"1:2 (staff to child)", needs:["Autism","ADHD","Learning disability","Physical disability","Communication difficulties","Anxiety"], cost:"Contact for pricing", funding:["Short Breaks funded","EHCP funded"], days:["Saturday"], time:"After school and holidays", contactName:"Kids Can Achieve Team", contactEmail:"info@kidscanachieve.co.uk", contactPhone:"Contact via website", website:"https://kidscanachieve.co.uk", factChecked:false, ownerId:"seed" },
  { id:"lon-5", name:"WeSwim Disability Swimming Club", organisation:"WeSwim", type:"Swimming", location:"London", postcode:"NW10 3NB", lat:51.5318, lng:-0.2297, description:"Volunteer-led disability swimming club at Moberly Sports Centre offering inclusive swimming sessions for disabled individuals. Part of a growing network of WeSwim clubs across London, building confidence and community in the pool. Website: weswim.org", ageMin:5, ageMax:99, accessibility:["Wheelchair accessible","Hoist available","Step-free access","Changing Places toilet"], support:"1:2 (staff to child)", needs:["Physical disability","Autism","Learning disability","Sensory processing","Cerebral palsy","Down's syndrome"], cost:"Free", funding:["Fully funded"], days:["Monday"], time:"18:15 – 19:45", contactName:"WeSwim Team", contactEmail:"info@weswim.org", contactPhone:"Contact via website", website:"https://weswim.org", factChecked:true, ownerId:"seed" },
  { id:"lon-6", name:"Chickenshed Inclusive Theatre", organisation:"Chickenshed Theatre", type:"Drama", location:"London", postcode:"N14 4PE", lat:51.6303, lng:-0.1285, description:"One of the UK's leading inclusive theatre companies where disabled and non-disabled children and young people create extraordinary performances together. Weekly workshops, productions and outreach across London. No auditions — everyone welcome. Website: chickenshed.org.uk", ageMin:5, ageMax:25, accessibility:["Wheelchair accessible","Step-free access","Low-arousal environment","Induction loop","Visual timetables"], support:"1:4 (staff to child)", needs:["Autism","Physical disability","Learning disability","ADHD","Hearing impairment","Visual impairment","Communication difficulties","Anxiety"], cost:"Contact for pricing", funding:["Bursary available","Charity grants available","Self-pay"], days:["Saturday","Sunday"], time:"Various — see website", contactName:"Chickenshed Enrolment", contactEmail:"info@chickenshed.org.uk", contactPhone:"020 8351 6161", website:"https://www.chickenshed.org.uk", factChecked:true, ownerId:"seed" },

  // ─── KENT ─────────────────────────────────────────────────────────────────
  { id:"kent-1", name:"Chigwell Riding Trust for Special Needs", organisation:"Chigwell Riding Trust", type:"Animal Therapy", location:"Loughton", postcode:"IG10 4AY", lat:51.6518, lng:0.0497, description:"The world's first purpose-built RDA riding centre, founded in 1964. Providing equestrian therapy to disabled children and adults for over 60 years. Riders have gone on to Paralympic success. Website: chigwellridingtrust.org.uk", ageMin:3, ageMax:99, accessibility:["Wheelchair accessible","Mounting ramp","Hoist available","Step-free access","Changing facilities"], support:"1:1 (staff to child)", needs:["Cerebral palsy","Physical disability","Autism","Learning disability","Down's syndrome","Sensory processing"], cost:"Contact for pricing", funding:["Charity grants available","EHCP funded","Short Breaks funded"], days:["Tuesday","Wednesday","Thursday","Saturday"], time:"Term time — contact centre", contactName:"Chigwell Riding Trust", contactEmail:"info@chigwellridingtrust.org.uk", contactPhone:"020 8508 4572", website:"https://www.chigwellridingtrust.org.uk", factChecked:true, ownerId:"seed" },
  { id:"kent-2", name:"Aspens Inclusive Arts & Activities", organisation:"Aspens Charity", type:"Arts & Crafts", location:"Tonbridge", postcode:"TN9 1RD", lat:51.1957, lng:0.2718, description:"Creative arts sessions, sports and social activities for children and young people with learning disabilities and autism across Kent. Art, music, dance and drama in welcoming, fully supported environments. Website: aspens.org.uk", ageMin:5, ageMax:25, accessibility:["Wheelchair accessible","Step-free access","Visual timetables","Sensory room","Quiet space"], support:"1:2 (staff to child)", needs:["Learning disability","Autism","Down's syndrome","ADHD","Communication difficulties","Physical disability"], cost:"Contact for pricing", funding:["Short Breaks funded","EHCP funded","Charity grants available"], days:["Saturday"], time:"Various — see website", contactName:"Aspens Team", contactEmail:"info@aspens.org.uk", contactPhone:"01732 366130", website:"https://www.aspens.org.uk", factChecked:true, ownerId:"seed" },
  { id:"kent-3", name:"Barrow Farm RDA Horse Riding", organisation:"Barrow Farm RDA", type:"Animal Therapy", location:"Chelmsford", postcode:"CM2 6RH", lat:51.7327, lng:0.4879, description:"Life-changing equestrian therapy for disabled children and adults. 104 volunteers, 28 riders passed grade tests in 2024, plus carriage driving and pony care. Tea with a Pony programme also available. Website: rda.org.uk", ageMin:3, ageMax:99, accessibility:["Mounting ramp","Step-free access","Changing facilities","Quiet approach route"], support:"1:1 (staff to child)", needs:["Physical disability","Cerebral palsy","Autism","Learning disability","Anxiety","Down's syndrome","Sensory processing"], cost:"Contact for pricing", funding:["Charity grants available","EHCP funded"], days:["Tuesday","Wednesday","Thursday","Saturday"], time:"Term time — contact centre", contactName:"Barrow Farm RDA", contactEmail:"info@barrowfarmrda.org.uk", contactPhone:"01245 421471", website:"https://rda.org.uk", factChecked:true, ownerId:"seed" },

  // ─── WEST SUSSEX & EAST SUSSEX ────────────────────────────────────────────
  { id:"wsussex-1", name:"Wave Project Surf Therapy", organisation:"The Wave Project", type:"Sports", location:"Brighton", postcode:"BN2 5NF", lat:50.8200, lng:-0.1040, description:"Surf therapy courses reducing anxiety, improving confidence and making children feel calmer and more positive about the future. Run by qualified surf instructors with extensive experience in disability and mental health. Website: waveproject.co.uk", ageMin:7, ageMax:18, accessibility:["Step-free access","Quiet space"], support:"1:3 (staff to child)", needs:["Autism","ADHD","Anxiety","Learning disability","Physical disability","Communication difficulties","Sensory processing"], cost:"Free (funded)", funding:["Charity grants available","Fully funded"], days:["Saturday","Sunday"], time:"Various — book online", contactName:"Wave Project Team", contactEmail:"info@waveproject.co.uk", contactPhone:"01637 872 772", website:"https://www.waveproject.co.uk", factChecked:true, ownerId:"seed" },
  { id:"wsussex-2", name:"St John's College Inclusive Activities", organisation:"Ambitious About Autism — St John's College", type:"Social Skills", location:"Brighton", postcode:"BN1 6XE", lat:50.8399, lng:-0.1521, description:"Specialist college and outreach activities for autistic young people in Brighton. Sports, arts, cooking, swimming and social groups. Part of the national Ambitious About Autism charity. Website: sjc.ac.uk", ageMin:16, ageMax:25, accessibility:["Wheelchair accessible","Step-free access","Sensory room","Visual timetables","Low-arousal environment"], support:"1:2 (staff to child)", needs:["Autism","ADHD","Anxiety","Communication difficulties","Learning disability","Sensory processing"], cost:"Contact for pricing", funding:["EHCP funded","Charity grants available"], days:["Monday","Tuesday","Wednesday","Thursday","Friday"], time:"Term time sessions", contactName:"St John's College", contactEmail:"enquiries@sjc.ac.uk", contactPhone:"01273 244000", website:"https://www.sjc.ac.uk", factChecked:true, ownerId:"seed" },

  // ─── HAMPSHIRE ────────────────────────────────────────────────────────────
  { id:"hants-1", name:"Naomi House Jacksplace Youth Activities", organisation:"Naomi House & Jacksplace", type:"Social Skills", location:"Winchester", postcode:"SO21 2JH", lat:51.1083, lng:-1.2645, description:"Respite care and activities for children and young adults with life-limiting conditions. Arts, music, swimming, sensory play and outdoor activities in a fully accessible hospice setting with specialist nursing support. Website: naomihouse.org.uk", ageMin:0, ageMax:25, accessibility:["Wheelchair accessible","Hoist available","Sensory room","Hydrotherapy pool","Quiet space","Step-free access","Changing Places toilet"], support:"1:1 (staff to child)", needs:["Physical disability","Global development delay","Cerebral palsy","Learning disability","Communication difficulties","Complex health needs"], cost:"Free (funded)", funding:["Charity grants available","Fully funded"], days:["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"], time:"By referral — contact charity", contactName:"Naomi House Jacksplace", contactEmail:"info@naomihouse.org.uk", contactPhone:"01962 760060", website:"https://www.naomihouse.org.uk", factChecked:true, ownerId:"seed" },
  { id:"hants-2", name:"Countryside Education Trust", organisation:"Countryside Education Trust", type:"Nature", location:"Beaulieu", postcode:"SO42 7YG", lat:50.8120, lng:-1.4530, description:"Outdoor and nature-based activities for children with additional needs in the New Forest. Farm visits, wildlife exploration and sensory nature play on working farmland. Sessions adapted for all disabilities. Website: cet.org.uk", ageMin:4, ageMax:18, accessibility:["Step-free access","Quiet space"], support:"1:3 (staff to child)", needs:["Autism","ADHD","Sensory processing","Anxiety","Learning disability","Physical disability"], cost:"Contact for pricing", funding:["Charity grants available","Short Breaks funded"], days:["Wednesday","Thursday","Saturday"], time:"Various — book in advance", contactName:"CET Team", contactEmail:"info@cet.org.uk", contactPhone:"01590 612401", website:"https://www.cet.org.uk", factChecked:false, ownerId:"seed" },

  // ─── DORSET & SOMERSET ────────────────────────────────────────────────────
  { id:"dorset-1", name:"Eden Project Relaxed Sessions", organisation:"Eden Project", type:"Sensory", location:"St Austell", postcode:"PL24 2SG", lat:50.3601, lng:-4.7449, description:"Relaxed and accessible sessions for children with autism and special needs during school holidays. The Eden Project works with the Sensory Trust to deliver calm, inclusive experiences. Sensory Trust guidance throughout. Website: edenproject.com", ageMin:0, ageMax:18, accessibility:["Wheelchair accessible","Step-free access","Sensory room","Quiet space","Low-arousal environment","Visual timetables"], support:"Varies by need", needs:["Autism","Sensory processing","ADHD","Anxiety","Learning disability","Communication difficulties"], cost:"Entry price applies — carer free", funding:["Self-pay"], days:["Wednesday","Thursday"], time:"School holidays — see website", contactName:"Eden Project", contactEmail:"info@edenproject.com", contactPhone:"01726 811911", website:"https://www.edenproject.com", factChecked:true, ownerId:"seed" },

  // ─── DEVON ────────────────────────────────────────────────────────────────
  { id:"devon-1", name:"Wave Project Surf Therapy — Devon", organisation:"The Wave Project", type:"Sports", location:"Newquay", postcode:"TR7 2NX", lat:50.4190, lng:-5.0842, description:"Surf therapy for children with disabilities and mental health challenges in Devon and Cornwall. Qualified instructors with disability and mental health expertise. Reduces anxiety, builds confidence and improves emotional wellbeing. Website: waveproject.co.uk", ageMin:7, ageMax:18, accessibility:["Step-free access","Quiet space"], support:"1:3 (staff to child)", needs:["Autism","ADHD","Anxiety","Learning disability","Sensory processing","Communication difficulties"], cost:"Free (funded)", funding:["Charity grants available","Fully funded"], days:["Saturday","Sunday"], time:"Various — book online", contactName:"Wave Project Cornwall", contactEmail:"info@waveproject.co.uk", contactPhone:"01637 872772", website:"https://www.waveproject.co.uk", factChecked:true, ownerId:"seed" },
  { id:"devon-2", name:"Erme Valley RDA Horse Riding", organisation:"Erme Valley RDA", type:"Animal Therapy", location:"Plymouth", postcode:"PL7 5BH", lat:50.3792, lng:-3.9928, description:"Therapeutic horse riding for disabled children and adults in Devon. Part of the national RDA network with 400+ groups across the UK. Horses provide physical therapy, confidence building and emotional wellbeing benefits. Website: rda.org.uk", ageMin:3, ageMax:99, accessibility:["Mounting ramp","Step-free access","Changing facilities"], support:"1:1 (staff to child)", needs:["Physical disability","Cerebral palsy","Autism","Learning disability","Anxiety","Down's syndrome"], cost:"Contact for pricing", funding:["Charity grants available","EHCP funded"], days:["Tuesday","Thursday","Saturday"], time:"Term time — contact group", contactName:"Erme Valley RDA", contactEmail:"Contact via website", contactPhone:"Contact via website", website:"https://rda.org.uk/rda-groups/", factChecked:false, ownerId:"seed" },

  // ─── WEST MIDLANDS & WARWICKSHIRE ─────────────────────────────────────────
  { id:"wmids-1", name:"Birmingham Disability Swimming", organisation:"Disability Swimming Club Birmingham", type:"Swimming", location:"Birmingham", postcode:"B15 2TT", lat:52.4698, lng:-1.9089, description:"Inclusive swimming programme for children with disabilities in Birmingham. Adapted lanes, trained instructors and welcoming environment for all abilities. Sessions aligned with Swim England's Inclusive Swimming Framework. Website: better.org.uk", ageMin:3, ageMax:18, accessibility:["Wheelchair accessible","Hoist available","Step-free access","Changing Places toilet"], support:"1:2 (staff to child)", needs:["Physical disability","Autism","Cerebral palsy","Learning disability","Sensory processing","Down's syndrome"], cost:"Contact for pricing", funding:["Short Breaks funded","Self-pay","DLA accepted"], days:["Saturday","Sunday"], time:"Various — see website", contactName:"Better Leisure Birmingham", contactEmail:"Contact via website", contactPhone:"0121 456 4444", website:"https://www.better.org.uk/what-we-offer/lessons-and-courses/swimming/disability", factChecked:false, ownerId:"seed" },
  { id:"wmids-2", name:"Mencap Gateway Leisure Club Birmingham", organisation:"Royal Mencap Society", type:"Social Skills", location:"Birmingham", postcode:"B5 4SA", lat:52.4751, lng:-1.8917, description:"Leisure and social clubs for children and young people with learning disabilities across Birmingham. Arts, sports, cookery, drama and trips in a supported social environment. Part of the national Mencap Gateway programme. Website: mencap.org.uk", ageMin:6, ageMax:25, accessibility:["Wheelchair accessible","Step-free access","Visual timetables","Quiet space"], support:"1:3 (staff to child)", needs:["Learning disability","Autism","Down's syndrome","Communication difficulties","Physical disability","Global development delay"], cost:"Contact for pricing", funding:["Short Breaks funded","Charity grants available"], days:["Saturday"], time:"Various — see website", contactName:"Mencap Birmingham", contactEmail:"contact@mencap.org.uk", contactPhone:"0808 808 1111", website:"https://www.mencap.org.uk", factChecked:true, ownerId:"seed" },
  { id:"wmids-3", name:"Caudwell Children Activity Grants", organisation:"Caudwell Children", type:"Social Skills", location:"Stoke-on-Trent", postcode:"ST4 6QR", lat:52.9980, lng:-2.1900, description:"National charity providing grants for specialist disability equipment and inclusive activity funding for disabled children. Also runs activity days and family support events across the UK. Website: caudwellchildren.com", ageMin:0, ageMax:17, accessibility:["Wheelchair accessible","Step-free access","Sensory room"], support:"Varies by need", needs:["Autism","Physical disability","Cerebral palsy","Learning disability","Down's syndrome","Global development delay","Communication difficulties"], cost:"Free (grant funded)", funding:["Charity grants available","Fully funded"], days:["Saturday","Sunday"], time:"Various events — see website", contactName:"Caudwell Children", contactEmail:"info@caudwellchildren.com", contactPhone:"01782 600054", website:"https://www.caudwellchildren.com", factChecked:true, ownerId:"seed" },

  // ─── EAST MIDLANDS ────────────────────────────────────────────────────────
  { id:"emids-1", name:"Disability Sport Nottingham", organisation:"Sport Nottingham Disability", type:"Sports", location:"Nottingham", postcode:"NG2 4HF", lat:52.9365, lng:-1.1342, description:"Inclusive sport sessions for disabled children and young people across Nottingham. Multi-sport sessions, boccia, goalball, wheelchair basketball and more. Activity Alliance affiliated, fully accessible sessions throughout the year. Website: sportnottingham.co.uk", ageMin:5, ageMax:25, accessibility:["Wheelchair accessible","Step-free access","Visual timetables"], support:"1:3 (staff to child)", needs:["Physical disability","Autism","Learning disability","Visual impairment","Hearing impairment","Cerebral palsy"], cost:"£2 per session", funding:["Self-pay","Short Breaks funded"], days:["Saturday"], time:"10:00 – 12:00", contactName:"Sport Nottingham", contactEmail:"disability@sportnottingham.co.uk", contactPhone:"0115 985 0440", website:"https://www.sportnottingham.co.uk", factChecked:false, ownerId:"seed" },
  { id:"emids-2", name:"Eureka! Children's Museum SEND Days", organisation:"Eureka! The National Children's Museum", type:"Sensory", location:"Halifax", postcode:"HX1 2NE", lat:53.7266, lng:-1.8553, description:"Interactive children's museum with hundreds of hands-on exhibits designed for children 0–11. Free entry for essential carers of disabled visitors. Trained 'Enabler' staff accompany families. Relaxed opening sessions for children with sensory needs. Website: eureka.org.uk", ageMin:0, ageMax:11, accessibility:["Wheelchair accessible","Step-free access","Visual timetables","Low-arousal environment","Quiet space","Sensory room"], support:"1:1 staff enablers", needs:["Autism","Sensory processing","ADHD","Learning disability","Physical disability","Communication difficulties","Anxiety"], cost:"Standard entry — carer free", funding:["Self-pay"], days:["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"], time:"During opening hours", contactName:"Eureka! Team", contactEmail:"info@eureka.org.uk", contactPhone:"01422 330069", website:"https://www.eureka.org.uk", factChecked:true, ownerId:"seed" },

  // ─── YORKSHIRE ────────────────────────────────────────────────────────────
  { id:"yorks-1", name:"Leeds Mencap Holiday Play Scheme", organisation:"Leeds Mencap", type:"Social Skills", location:"Leeds", postcode:"LS12 1AX", lat:53.8008, lng:-1.5677, description:"Specialist holiday playschemes for children and young people with learning disabilities and autism in Leeds. Creative arts, sports, cookery and trips with trained specialist staff. Independent local charity for over 70 years. Website: leedsmencap.org.uk", ageMin:5, ageMax:25, accessibility:["Wheelchair accessible","Step-free access","Visual timetables","Sensory room","Quiet space"], support:"1:2 (staff to child)", needs:["Learning disability","Autism","Down's syndrome","ADHD","Communication difficulties","Physical disability"], cost:"Contact for pricing", funding:["Short Breaks funded","EHCP funded","Charity grants available"], days:["Monday","Tuesday","Wednesday","Thursday","Friday"], time:"School holidays — see website", contactName:"Leeds Mencap", contactEmail:"info@leedsmencap.org.uk", contactPhone:"0113 235 4300", website:"https://www.leedsmencap.org.uk", factChecked:true, ownerId:"seed" },
  { id:"yorks-2", name:"Disability Sport Yorkshire Activ8 Leeds", organisation:"Disability Sport Yorkshire", type:"Sports", location:"Leeds", postcode:"LS11 5DJ", lat:53.7815, lng:-1.5714, description:"Inclusive sports events and regular sessions for disabled children and young people across Yorkshire. Activ8 inclusive sports days at the John Charles Centre. Also runs StrongHER Together programme for disabled females aged 10–18. Website: disabilitysportyorkshire.org", ageMin:5, ageMax:25, accessibility:["Wheelchair accessible","Step-free access","Changing Places toilet"], support:"1:3 (staff to child)", needs:["Physical disability","Autism","Learning disability","Visual impairment","Hearing impairment","Cerebral palsy","ADHD"], cost:"Contact for pricing", funding:["Charity grants available","Short Breaks funded"], days:["Saturday"], time:"Various — see website", contactName:"Disability Sport Yorkshire", contactEmail:"info@disabilitysportyorkshire.org", contactPhone:"0113 273 1530", website:"https://disabilitysportyorkshire.org", factChecked:true, ownerId:"seed" },
  { id:"yorks-3", name:"Fuse Theatre Inclusive Youth Group", organisation:"Fuse Theatre", type:"Drama", location:"Scarborough", postcode:"YO11 1JW", lat:54.2772, lng:-0.4013, description:"Inclusive youth disability theatre group for children and young people with special educational needs and varied disabilities. Performances tour around North Yorkshire. An inspiring creative environment where everyone's voice is heard. Website: fusetheatre.co.uk", ageMin:8, ageMax:25, accessibility:["Step-free access","Visual timetables","Low-arousal environment","Quiet space"], support:"1:3 (staff to child)", needs:["Learning disability","Autism","Physical disability","ADHD","Communication difficulties","Anxiety"], cost:"Contact for pricing", funding:["Charity grants available","Short Breaks funded"], days:["Saturday"], time:"Various — contact theatre", contactName:"Fuse Theatre", contactEmail:"info@fusetheatre.co.uk", contactPhone:"Contact via website", website:"https://www.fusetheatre.co.uk", factChecked:false, ownerId:"seed" },

  // ─── LANCASHIRE & GREATER MANCHESTER ─────────────────────────────────────
  { id:"manc-1", name:"Salford Community Leisure SEND Sessions", organisation:"Salford Community Leisure", type:"Sports", location:"Salford", postcode:"M5 4WT", lat:53.4856, lng:-2.2747, description:"Swimming, dance and music sessions adapted for children with additional needs across Salford leisure centres. Fully accessible facilities with trained inclusive sport instructors. Part of Salford's local SEND activity offer. Website: salfordcommunityleisure.co.uk", ageMin:3, ageMax:18, accessibility:["Wheelchair accessible","Hoist available","Step-free access","Sensory room"], support:"1:3 (staff to child)", needs:["Autism","Physical disability","Learning disability","Sensory processing","ADHD","Communication difficulties"], cost:"Contact for pricing", funding:["Short Breaks funded","Self-pay"], days:["Saturday","Sunday"], time:"Various — see website", contactName:"SCL Disability Team", contactEmail:"info@salfordcommunityleisure.co.uk", contactPhone:"0161 778 0680", website:"https://www.salfordcommunityleisure.co.uk", factChecked:false, ownerId:"seed" },
  { id:"manc-2", name:"Manchester Aquatics Centre Inclusive Swim", organisation:"Manchester Leisure", type:"Swimming", location:"Manchester", postcode:"M13 9PL", lat:53.4669, lng:-2.2267, description:"Inclusive swimming lessons and disability sessions at Manchester Aquatics Centre. Adapted programmes for children with physical, learning and sensory disabilities. Pool hoist, Changing Places and trained disability swim coaches available. Website: manchesterleisure.co.uk", ageMin:3, ageMax:18, accessibility:["Wheelchair accessible","Hoist available","Changing Places toilet","Step-free access"], support:"1:2 (staff to child)", needs:["Physical disability","Autism","Learning disability","Sensory processing","Cerebral palsy"], cost:"Contact for pricing", funding:["Short Breaks funded","Self-pay"], days:["Saturday","Sunday"], time:"Various — contact centre", contactName:"Manchester Aquatics Centre", contactEmail:"aquatics@manchester.gov.uk", contactPhone:"0161 245 5680", website:"https://www.manchesterleisure.co.uk", factChecked:false, ownerId:"seed" },
  { id:"manc-3", name:"ADHD Foundation Umbrella Programme", organisation:"ADHD Foundation", type:"Social Skills", location:"Liverpool", postcode:"L1 0BG", lat:53.4047, lng:-2.9878, description:"Free sport, arts and social activities for neurodivergent children through the Umbrella Programme across Liverpool and North West England. Football, art, music and confidence-building sessions. Website: adhdfoundation.org.uk", ageMin:6, ageMax:18, accessibility:["Step-free access","Visual timetables","Low-arousal environment","Quiet space"], support:"1:4 (staff to child)", needs:["ADHD","Autism","Anxiety","Sensory processing","Communication difficulties","Learning disability"], cost:"Free", funding:["Charity grants available","Fully funded"], days:["Saturday"], time:"Various — see website", contactName:"ADHD Foundation", contactEmail:"info@adhdfoundation.org.uk", contactPhone:"0151 237 2661", website:"https://www.adhdfoundation.org.uk", factChecked:true, ownerId:"seed" },

  // ─── NORTH EAST ───────────────────────────────────────────────────────────
  { id:"ne-1", name:"Liberdade Physical Theatre Newcastle", organisation:"Liberdade", type:"Drama", location:"Newcastle", postcode:"NE1 4ST", lat:54.9756, lng:-1.6152, description:"Physical theatre company founded to give people with learning disabilities the opportunity to run their own theatre company. Workshops, performances and inclusive creative sessions in Newcastle and across the North East. Website: liberdade.co.uk", ageMin:16, ageMax:99, accessibility:["Step-free access","Visual timetables","Low-arousal environment"], support:"1:3 (staff to child)", needs:["Learning disability","Autism","Physical disability","Communication difficulties","Down's syndrome"], cost:"Contact for pricing", funding:["Charity grants available","Bursary available"], days:["Wednesday","Saturday"], time:"Various — see website", contactName:"Liberdade Company", contactEmail:"info@liberdade.co.uk", contactPhone:"Contact via website", website:"https://www.liberdade.co.uk", factChecked:false, ownerId:"seed" },
  { id:"ne-2", name:"Sunderland Sailability Inclusive Sailing", organisation:"RYA Sailability Sunderland", type:"Sports", location:"Sunderland", postcode:"SR6 0PW", lat:54.9241, lng:-1.3670, description:"Inclusive sailing for children and adults with disabilities at Sunderland Marina. Part of the Royal Yachting Association's Sailability programme. No experience or swimming ability required. Boats and facilities adapted for all abilities. Website: rya.org.uk/sailability", ageMin:7, ageMax:99, accessibility:["Wheelchair accessible","Step-free access","Changing facilities"], support:"1:2 (staff to child)", needs:["Physical disability","Autism","Learning disability","Visual impairment","Cerebral palsy","ADHD"], cost:"Contact for pricing", funding:["Charity grants available","Self-pay"], days:["Saturday","Sunday"], time:"Summer season — book ahead", contactName:"RYA Sailability Sunderland", contactEmail:"sailability@rya.org.uk", contactPhone:"023 8060 4100", website:"https://www.rya.org.uk/training-and-qualifications/sailability", factChecked:false, ownerId:"seed" },

  // ─── EAST ANGLIA ──────────────────────────────────────────────────────────
  { id:"ea-1", name:"Space Hertfordshire SEND Activities", organisation:"SPACE Hertfordshire", type:"Social Skills", location:"Hertford", postcode:"SG13 8NQ", lat:51.7953, lng:-0.0780, description:"Support and activities for families of children with autism, ADHD and neurodiverse conditions across Hertfordshire. Playgroups, social events, holiday activities and family support. Website: spaceherts.org.uk", ageMin:0, ageMax:18, accessibility:["Step-free access","Visual timetables","Low-arousal environment","Quiet space"], support:"1:3 (staff to child)", needs:["Autism","ADHD","Anxiety","Communication difficulties","Sensory processing","Learning disability"], cost:"Contact for pricing", funding:["Charity grants available","Self-pay"], days:["Saturday"], time:"Various — see website", contactName:"SPACE Herts", contactEmail:"info@spaceherts.org.uk", contactPhone:"Contact via website", website:"https://www.spaceherts.org.uk", factChecked:false, ownerId:"seed" },
  { id:"ea-2", name:"Short Breaks Hertfordshire", organisation:"Short Breaks Hertfordshire", type:"Social Skills", location:"Hemel Hempstead", postcode:"HP2 4TQ", lat:51.7538, lng:-0.4218, description:"Funded short break activities for disabled children across Hertfordshire. Chance to socialise and do fun activities giving families a break. Well-supported by trained workers in safe inclusive environments. Website: hertfordshire.gov.uk", ageMin:5, ageMax:18, accessibility:["Wheelchair accessible","Step-free access","Visual timetables","Sensory room"], support:"1:2 (staff to child)", needs:["Learning disability","Autism","Physical disability","ADHD","Global development delay","Communication difficulties"], cost:"Free (short breaks funded)", funding:["Short Breaks funded","EHCP funded"], days:["Saturday"], time:"Various — see website", contactName:"Hertfordshire Short Breaks", contactEmail:"shortbreaks@hertfordshire.gov.uk", contactPhone:"0300 123 4043", website:"https://www.hertfordshire.gov.uk", factChecked:true, ownerId:"seed" },

  // ─── WALES ────────────────────────────────────────────────────────────────
  { id:"wales-1", name:"Mencap Cymru Leisure Clubs", organisation:"Mencap Cymru", type:"Social Skills", location:"Cardiff", postcode:"CF10 1GF", lat:51.4816, lng:-3.1791, description:"Leisure and social clubs for children and young people with learning disabilities across Wales. Sport, arts, cookery and social activities in Cardiff and across Welsh counties. Part of the Royal Mencap Society. Website: mencap.org.uk/wales", ageMin:6, ageMax:25, accessibility:["Wheelchair accessible","Step-free access","Visual timetables"], support:"1:3 (staff to child)", needs:["Learning disability","Autism","Down's syndrome","Communication difficulties","Physical disability"], cost:"Contact for pricing", funding:["Short Breaks funded","Charity grants available"], days:["Saturday"], time:"Various — see website", contactName:"Mencap Cymru", contactEmail:"wales@mencap.org.uk", contactPhone:"029 2074 7588", website:"https://www.mencap.org.uk/about-us/wales", factChecked:true, ownerId:"seed" },
  { id:"wales-2", name:"Disability Sport Wales Inclusive Sessions", organisation:"Disability Sport Wales", type:"Sports", location:"Cardiff", postcode:"CF11 9XR", lat:51.4750, lng:-3.2004, description:"Inclusive sport and physical activity sessions for disabled children across Wales. Boccia, wheelchair basketball, swimming, athletics and more. Works with local authorities and sport clubs to create accessible opportunities. Website: disabilitysportwales.com", ageMin:5, ageMax:25, accessibility:["Wheelchair accessible","Step-free access","Changing Places toilet"], support:"1:3 (staff to child)", needs:["Physical disability","Autism","Learning disability","Visual impairment","Hearing impairment","Cerebral palsy","ADHD"], cost:"Contact for pricing", funding:["Charity grants available","Short Breaks funded"], days:["Saturday","Sunday"], time:"Various — see website", contactName:"DSW Team", contactEmail:"info@disabilitysportwales.com", contactPhone:"029 2033 4972", website:"https://www.disabilitysportwales.com", factChecked:true, ownerId:"seed" },
  { id:"wales-3", name:"Wave Project Surf Therapy — Wales", organisation:"The Wave Project", type:"Sports", location:"Swansea", postcode:"SA1 1NS", lat:51.6214, lng:-3.9436, description:"Surf therapy for children with disabilities and mental health challenges in Wales. Qualified instructors with disability expertise. Reduces anxiety and builds confidence through surfing. Website: waveproject.co.uk", ageMin:7, ageMax:18, accessibility:["Step-free access","Quiet space"], support:"1:3 (staff to child)", needs:["Autism","ADHD","Anxiety","Learning disability","Sensory processing","Communication difficulties"], cost:"Free (funded)", funding:["Charity grants available","Fully funded"], days:["Saturday","Sunday"], time:"Various — book online", contactName:"Wave Project Wales", contactEmail:"info@waveproject.co.uk", contactPhone:"01637 872772", website:"https://www.waveproject.co.uk", factChecked:true, ownerId:"seed" },

  // ─── SCOTLAND ─────────────────────────────────────────────────────────────
  { id:"scot-1", name:"Enable Scotland Inclusive Activities", organisation:"Enable Scotland", type:"Social Skills", location:"Glasgow", postcode:"G1 1DQ", lat:55.8642, lng:-4.2518, description:"Activities, clubs and social events for children and adults with learning disabilities across Scotland. Sport, arts, music and community activities empowering disabled Scots to live full lives. Website: enable.org.uk", ageMin:5, ageMax:99, accessibility:["Wheelchair accessible","Step-free access","Visual timetables"], support:"1:2 (staff to child)", needs:["Learning disability","Autism","Down's syndrome","Communication difficulties","Physical disability","ADHD"], cost:"Contact for pricing", funding:["Short Breaks funded","Charity grants available"], days:["Saturday"], time:"Various — see website", contactName:"Enable Scotland", contactEmail:"enable@enable.org.uk", contactPhone:"0141 226 4541", website:"https://www.enable.org.uk", factChecked:true, ownerId:"seed" },
  { id:"scot-2", name:"Disability Sport Scotland Inclusive Clubs", organisation:"Disability Sport Scotland", type:"Sports", location:"Edinburgh", postcode:"EH6 5NP", lat:55.9533, lng:-3.1883, description:"Inclusive sport sessions for disabled children and young people across Scotland. Boccia, wheelchair sports, athletics, swimming and adapted team sports. Works with over 70 sport disability clubs nationwide. Website: disabilitysportscotland.org", ageMin:5, ageMax:25, accessibility:["Wheelchair accessible","Step-free access","Changing Places toilet"], support:"1:3 (staff to child)", needs:["Physical disability","Autism","Learning disability","Visual impairment","Cerebral palsy","ADHD","Hearing impairment"], cost:"Contact for pricing", funding:["Charity grants available","Short Breaks funded"], days:["Saturday","Sunday"], time:"Various — see website", contactName:"Disability Sport Scotland", contactEmail:"info@disabilitysportscotland.org", contactPhone:"0131 317 1130", website:"https://www.disabilitysportscotland.org", factChecked:true, ownerId:"seed" },
  { id:"scot-3", name:"Mencap Scotland Leisure Activities", organisation:"Mencap Scotland", type:"Social Skills", location:"Edinburgh", postcode:"EH1 1YL", lat:55.9500, lng:-3.1900, description:"Social and leisure activities for children and young people with learning disabilities across Scotland. Arts, sports, cookery and supported social clubs in Edinburgh and across Scottish councils. Website: mencap.org.uk/scotland", ageMin:6, ageMax:25, accessibility:["Wheelchair accessible","Step-free access","Visual timetables"], support:"1:3 (staff to child)", needs:["Learning disability","Autism","Down's syndrome","Communication difficulties","Physical disability"], cost:"Contact for pricing", funding:["Short Breaks funded","Charity grants available"], days:["Saturday"], time:"Various — see website", contactName:"Mencap Scotland", contactEmail:"scotland@mencap.org.uk", contactPhone:"0131 221 0879", website:"https://www.mencap.org.uk/about-us/scotland", factChecked:true, ownerId:"seed" },

  // ─── NATIONAL PROGRAMMES (available UK-wide) ─────────────────────────────
  { id:"nat-1", name:"RDA Horse Riding — Find Your Local Group", organisation:"Riding for the Disabled Association", type:"Animal Therapy", location:"Nationwide UK", postcode:"CV35 7AX", lat:52.2850, lng:-1.5900, description:"Over 400 RDA groups across the UK providing therapeutic horse riding for 25,000+ disabled children and adults. Physical, sensory and learning disabilities, autism, ADHD all supported. Use the RDA group finder to find your nearest centre. Website: rda.org.uk", ageMin:3, ageMax:99, accessibility:["Mounting ramp","Step-free access","Changing facilities","Quiet approach route"], support:"1:1 (staff to child)", needs:["Physical disability","Cerebral palsy","Autism","Learning disability","Anxiety","Down's syndrome","Sensory processing","ADHD"], cost:"Contact local group", funding:["Charity grants available","EHCP funded","Self-pay"], days:["Tuesday","Wednesday","Thursday","Saturday"], time:"Term time — contact your local group", contactName:"RDA National Office", contactEmail:"info@rda.org.uk", contactPhone:"02476 696510", website:"https://rda.org.uk/rda-groups/", factChecked:true, ownerId:"seed" },
  { id:"nat-2", name:"Wheels for All Inclusive Cycling — Find Local", organisation:"Wheels for All", type:"Sports", location:"Nationwide UK", postcode:"WA1 1QW", lat:53.3910, lng:-2.5953, description:"National charity providing inclusive cycling for people of all abilities using adapted bikes. Trikes, handcycles, tandems and wheelchair transporters available at 60+ locations across England. Find your nearest session on the website. Website: wheelsforall.org.uk", ageMin:3, ageMax:99, accessibility:["Wheelchair accessible","Step-free access"], support:"1:2 (staff to child)", needs:["Physical disability","Cerebral palsy","Autism","Learning disability","Visual impairment","Down's syndrome","ADHD","Sensory processing"], cost:"Free or low-cost", funding:["Charity grants available","Fully funded"], days:["Saturday","Sunday"], time:"Various — find local session online", contactName:"Wheels for All National", contactEmail:"info@wheelsforall.org.uk", contactPhone:"01925 828500", website:"https://wheelsforall.org.uk", factChecked:true, ownerId:"seed" },
  { id:"nat-3", name:"Wave Project Surf Therapy — Nationwide", organisation:"The Wave Project", type:"Sports", location:"Nationwide UK", postcode:"TR7 2NX", lat:50.4190, lng:-5.0842, description:"National surf therapy charity running courses across coastal UK. Reduces anxiety, builds confidence and makes children feel calmer. Projects in Cornwall, Devon, Wales, Dorset, Yorkshire and more. Qualified instructors with disability and mental health expertise. Website: waveproject.co.uk", ageMin:7, ageMax:18, accessibility:["Step-free access","Quiet space"], support:"1:3 (staff to child)", needs:["Autism","ADHD","Anxiety","Learning disability","Sensory processing","Communication difficulties","Physical disability"], cost:"Free (funded)", funding:["Charity grants available","Fully funded"], days:["Saturday","Sunday"], time:"Book online — various dates", contactName:"Wave Project National", contactEmail:"info@waveproject.co.uk", contactPhone:"01637 872772", website:"https://www.waveproject.co.uk", factChecked:true, ownerId:"seed" },
  { id:"nat-4", name:"Activity Alliance Inclusive Sport Finder", organisation:"Activity Alliance", type:"Sports", location:"Nationwide UK", postcode:"LS10 1JR", lat:53.7921, lng:-1.5453, description:"National umbrella body for disability sport in England. The Activity Alliance website has a searchable listing of inclusive sport events by region — swimming galas, tennis, football talent days and more for disabled children. Website: activityalliance.org.uk", ageMin:5, ageMax:25, accessibility:["Wheelchair accessible","Step-free access"], support:"Varies by activity", needs:["Physical disability","Autism","Learning disability","Visual impairment","Hearing impairment","Cerebral palsy","ADHD"], cost:"Varies by event", funding:["Varies by activity"], days:["Saturday","Sunday"], time:"Various — search online", contactName:"Activity Alliance", contactEmail:"info@activityalliance.org.uk", contactPhone:"01509 227750", website:"https://www.activityalliance.org.uk", factChecked:true, ownerId:"seed" },
  { id:"nat-5", name:"Sailability Inclusive Sailing — Find Local", organisation:"Royal Yachting Association Sailability", type:"Sports", location:"Nationwide UK", postcode:"SO31 4YH", lat:50.8744, lng:-1.3547, description:"National inclusive sailing programme for disabled people of all ages and abilities. 200+ Sailability clubs across the UK with adapted boats and facilities. No swimming ability required. Find your nearest approved Sailability club on the RYA website. Website: rya.org.uk/sailability", ageMin:5, ageMax:99, accessibility:["Wheelchair accessible","Step-free access","Changing facilities"], support:"1:2 (staff to child)", needs:["Physical disability","Autism","Learning disability","Visual impairment","Cerebral palsy","ADHD","Hearing impairment"], cost:"Contact local club", funding:["Charity grants available","Self-pay"], days:["Saturday","Sunday"], time:"Summer season — contact local club", contactName:"RYA Sailability", contactEmail:"sailability@rya.org.uk", contactPhone:"023 8060 4100", website:"https://www.rya.org.uk/training-and-qualifications/sailability", factChecked:true, ownerId:"seed" },
  { id:"nat-6", name:"Little Miracles Disability Play Groups", organisation:"Little Miracles", type:"Sensory", location:"Peterborough", postcode:"PE2 6YW", lat:52.5695, lng:-0.2405, description:"Charity providing advice, activities and safe places for families of children with additional needs, disabilities or life-limiting conditions. National network of local branches with play groups, events and family support. Website: littlemiraclescharity.org.uk", ageMin:0, ageMax:18, accessibility:["Wheelchair accessible","Sensory room","Step-free access","Visual timetables","Quiet space"], support:"1:2 (staff to child)", needs:["Autism","Physical disability","Learning disability","Global development delay","Communication difficulties","Down's syndrome","Sensory processing"], cost:"Free or low-cost", funding:["Charity grants available","Fully funded"], days:["Saturday"], time:"Various — find local branch", contactName:"Little Miracles", contactEmail:"info@littlemiraclescharity.org.uk", contactPhone:"01733 262226", website:"https://www.littlemiraclescharity.org.uk", factChecked:true, ownerId:"seed" },

  // ─── NORTH WEST / CHESHIRE ────────────────────────────────────────────────
  { id:"nw-1", name:"Cheshire Sport Stars Disability Sessions", organisation:"Active Cheshire", type:"Sports", location:"Chester", postcode:"CH1 4LT", lat:53.1905, lng:-2.8910, description:"Inclusive sport and physical activity for disabled children across Cheshire. Multi-sport sessions, swimming, wheelchair sports and more. Active Cheshire works with local clubs to create fully accessible opportunities. Website: activecheshire.org", ageMin:5, ageMax:25, accessibility:["Wheelchair accessible","Step-free access","Visual timetables"], support:"1:3 (staff to child)", needs:["Physical disability","Autism","Learning disability","ADHD","Cerebral palsy","Communication difficulties"], cost:"Contact for pricing", funding:["Short Breaks funded","Charity grants available"], days:["Saturday"], time:"Various — see website", contactName:"Active Cheshire", contactEmail:"info@activecheshire.org", contactPhone:"01244 342336", website:"https://www.activecheshire.org", factChecked:false, ownerId:"seed" },
  { id:"nw-2", name:"Mencap Gateway Club — North West", organisation:"Wirral Mencap", type:"Social Skills", location:"Birkenhead", postcode:"CH41 5BX", lat:53.3940, lng:-3.0139, description:"Leisure and social clubs for young people with learning disabilities on the Wirral and across Merseyside. Arts, sports, cookery and social activities in a warm, supported setting. Part of the Royal Mencap Society network. Website: wirralmencap.org", ageMin:5, ageMax:25, accessibility:["Wheelchair accessible","Step-free access","Visual timetables","Quiet space"], support:"1:3 (staff to child)", needs:["Learning disability","Autism","Down's syndrome","ADHD","Communication difficulties","Physical disability"], cost:"Contact for pricing", funding:["Short Breaks funded","Charity grants available"], days:["Saturday"], time:"Various — see website", contactName:"Wirral Mencap", contactEmail:"info@wirralmencap.org", contactPhone:"0151 647 3155", website:"https://www.wirralmencap.org", factChecked:false, ownerId:"seed" },

  // ─── OXFORDSHIRE & BERKSHIRE ─────────────────────────────────────────────
  { id:"ox-1", name:"Oxford KIDS Charity Holiday Play", organisation:"KIDS Charity", type:"Social Skills", location:"Oxford", postcode:"OX1 1BP", lat:51.7520, lng:-1.2577, description:"Holiday play schemes and activity sessions for disabled children in Oxford. Short break support giving disabled children a chance to socialise, try new things and have fun with trained specialist staff. Website: kids.org.uk", ageMin:5, ageMax:18, accessibility:["Wheelchair accessible","Step-free access","Visual timetables","Sensory room"], support:"1:2 (staff to child)", needs:["Physical disability","Autism","Learning disability","Cerebral palsy","Global development delay","Communication difficulties"], cost:"Contact for pricing", funding:["Short Breaks funded","EHCP funded","Charity grants available"], days:["Monday","Tuesday","Wednesday","Thursday","Friday"], time:"School holidays", contactName:"KIDS Oxford", contactEmail:"southmidlands@kids.org.uk", contactPhone:"01865 208454", website:"https://www.kids.org.uk", factChecked:true, ownerId:"seed" },
  { id:"ox-2", name:"Bucks & Berks RDA Horse Riding", organisation:"RDA Thames Valley", type:"Animal Therapy", location:"Maidenhead", postcode:"SL6 6QH", lat:51.5236, lng:-0.7191, description:"Therapeutic horse riding for disabled children and adults in the Thames Valley. Multiple RDA groups across Berkshire and Buckinghamshire. Use the RDA group finder to locate the nearest centre. Website: rda.org.uk", ageMin:3, ageMax:99, accessibility:["Mounting ramp","Step-free access","Changing facilities"], support:"1:1 (staff to child)", needs:["Physical disability","Cerebral palsy","Autism","Learning disability","Anxiety","Down's syndrome"], cost:"Contact local group", funding:["Charity grants available","EHCP funded"], days:["Tuesday","Thursday","Saturday"], time:"Term time — contact group", contactName:"RDA Thames Valley", contactEmail:"info@rda.org.uk", contactPhone:"02476 696510", website:"https://rda.org.uk/rda-groups/", factChecked:false, ownerId:"seed" },

  // ─── MIDLANDS / LINCOLNSHIRE ──────────────────────────────────────────────
  { id:"lincs-1", name:"Lincolnshire RDA Horse Riding", organisation:"RDA Lincolnshire", type:"Animal Therapy", location:"Lincoln", postcode:"LN1 3AT", lat:53.2307, lng:-0.5406, description:"Therapeutic horse riding for disabled children and adults across Lincolnshire. Multiple RDA groups supporting physical, sensory and learning disabilities, autism and ADHD through the power of horses. Website: rda.org.uk", ageMin:3, ageMax:99, accessibility:["Mounting ramp","Step-free access","Changing facilities","Quiet approach route"], support:"1:1 (staff to child)", needs:["Physical disability","Cerebral palsy","Autism","Learning disability","Anxiety","ADHD","Sensory processing"], cost:"Contact local group", funding:["Charity grants available","EHCP funded"], days:["Wednesday","Saturday"], time:"Term time — contact group", contactName:"RDA Lincolnshire", contactEmail:"info@rda.org.uk", contactPhone:"02476 696510", website:"https://rda.org.uk/rda-groups/", factChecked:false, ownerId:"seed" },

  // ─── NORFOLK & SUFFOLK ────────────────────────────────────────────────────
  { id:"norfolk-1", name:"Norfolk Disability Sports & Activities", organisation:"Norfolk Sport", type:"Sports", location:"Norwich", postcode:"NR1 3RX", lat:52.6297, lng:1.2982, description:"Inclusive sport and physical activity sessions for disabled children in Norfolk. Activities include boccia, swimming, athletics, and multi-sport sessions across Norfolk leisure centres and community venues. Website: norfolksport.org.uk", ageMin:5, ageMax:25, accessibility:["Wheelchair accessible","Step-free access","Visual timetables"], support:"1:3 (staff to child)", needs:["Physical disability","Autism","Learning disability","ADHD","Cerebral palsy","Visual impairment"], cost:"Contact for pricing", funding:["Short Breaks funded","Charity grants available"], days:["Saturday","Sunday"], time:"Various — see website", contactName:"Norfolk Sport", contactEmail:"info@norfolksport.org.uk", contactPhone:"01603 631133", website:"https://www.norfolksport.org.uk", factChecked:false, ownerId:"seed" },

  // ─── NORTHERN IRELAND ─────────────────────────────────────────────────────
  { id:"ni-1", name:"Mencap Northern Ireland Activities", organisation:"Mencap Northern Ireland", type:"Social Skills", location:"Belfast", postcode:"BT1 3NQ", lat:54.5973, lng:-5.9301, description:"Social clubs, leisure activities and short breaks for children and young people with learning disabilities across Northern Ireland. Arts, sports, swimming and social activities with trained specialist staff. Website: mencap.org.uk/northern-ireland", ageMin:5, ageMax:25, accessibility:["Wheelchair accessible","Step-free access","Visual timetables"], support:"1:3 (staff to child)", needs:["Learning disability","Autism","Down's syndrome","Communication difficulties","Physical disability","ADHD"], cost:"Contact for pricing", funding:["Short Breaks funded","Charity grants available"], days:["Saturday"], time:"Various — see website", contactName:"Mencap NI", contactEmail:"ni@mencap.org.uk", contactPhone:"028 9069 1351", website:"https://www.mencap.org.uk/about-us/northern-ireland", factChecked:true, ownerId:"seed" },
  { id:"ni-2", name:"Disability Sport NI Inclusive Clubs", organisation:"Disability Sport Northern Ireland", type:"Sports", location:"Belfast", postcode:"BT3 9AA", lat:54.6120, lng:-5.8630, description:"Inclusive sport sessions for disabled children across Northern Ireland. Boccia, wheelchair basketball, para athletics, swimming and more. DSNI supports over 60 disability sport clubs across all nine counties. Website: dsni.co.uk", ageMin:5, ageMax:25, accessibility:["Wheelchair accessible","Step-free access","Changing Places toilet"], support:"1:3 (staff to child)", needs:["Physical disability","Autism","Learning disability","Visual impairment","Hearing impairment","Cerebral palsy"], cost:"Contact for pricing", funding:["Charity grants available","Short Breaks funded"], days:["Saturday","Sunday"], time:"Various — see website", contactName:"DSNI Team", contactEmail:"info@dsni.co.uk", contactPhone:"028 9038 7062", website:"https://www.dsni.co.uk", factChecked:true, ownerId:"seed" },

  // ─── ESSEX ────────────────────────────────────────────────────────────────
  { id:"essex-1", name:"Essex Short Breaks Clubs & Activities", organisation:"Action for Children Essex", type:"Social Skills", location:"Colchester", postcode:"CO1 1JH", lat:51.8959, lng:0.8919, description:"Fun inclusive clubs and activities for disabled children across Essex, delivered by 29 approved providers. Holiday clubs, Saturday clubs, arts, sports, sensory play and more. Open to children awaiting autism diagnosis. Website: actionforchildren.org.uk", ageMin:5, ageMax:18, accessibility:["Wheelchair accessible","Step-free access","Visual timetables","Quiet space","Sensory room"], support:"1:2 (staff to child)", needs:["Autism","Learning disability","Physical disability","ADHD","Sensory processing","Global development delay","Communication difficulties"], cost:"Contact for pricing", funding:["Short Breaks funded","EHCP funded","Charity grants available"], days:["Saturday","Sunday"], time:"Weekends and school holidays", contactName:"Action for Children Essex", contactEmail:"essexshortbreaks@actionforchildren.org.uk", contactPhone:"Contact via website", website:"https://services.actionforchildren.org.uk/essex-short-breaks-clubs-and-activities/", factChecked:true, ownerId:"seed" },
  { id:"essex-2", name:"Essex Outdoors Inclusive Activity Days", organisation:"Essex Outdoors", type:"Nature", location:"Danbury", postcode:"CM3 4JD", lat:51.7163, lng:0.5578, description:"Challenging outdoor activity days for disabled children and young people at Essex Outdoors centres in Bradwell, Danbury, Harlow and Mersea. Activities include kayaking, climbing, archery and teambuilding. DfE funded places available for children awaiting autism diagnosis. Website: essexoutdoors.com", ageMin:8, ageMax:18, accessibility:["Wheelchair accessible","Step-free access","Quiet space"], support:"1:3 (staff to child)", needs:["Autism","ADHD","Learning disability","Sensory processing","Anxiety","Physical disability"], cost:"Contact for pricing", funding:["Short Breaks funded","DfE funded","Self-pay"], days:["Monday","Tuesday","Wednesday","Thursday","Friday"], time:"School holidays — see website", contactName:"Essex Outdoors", contactEmail:"info@essexoutdoors.com", contactPhone:"01621 774321", website:"https://www.essexoutdoors.com", factChecked:true, ownerId:"seed" },
  { id:"essex-3", name:"West Essex Inclusion Project", organisation:"West Essex Inclusion Project", type:"Sports", location:"Epping", postcode:"CM16 4BZ", lat:51.6950, lng:0.1148, description:"Inclusive multi-sport sessions for children with learning disabilities and autism across West Essex. Monday multi-sports group, plus horse riding sessions at Barnfields Riding Stables and a Step Into Dance programme. Disability Day events at Lord's Cricket Ground. Website: eppingforestdc.gov.uk", ageMin:5, ageMax:18, accessibility:["Step-free access","Visual timetables","Quiet space","Low-arousal environment"], support:"1:3 (staff to child)", needs:["Learning disability","Autism","Physical disability","ADHD","Communication difficulties","Sensory processing"], cost:"Contact for pricing", funding:["Short Breaks funded","Charity grants available"], days:["Monday","Saturday"], time:"Various — see website", contactName:"West Essex Inclusion Project", contactEmail:"Contact via website", contactPhone:"Contact via website", website:"https://www.eppingforestdc.gov.uk/category/news/leisure-and-culture/", factChecked:true, ownerId:"seed" },

  // ─── KENT & MEDWAY ────────────────────────────────────────────────────────
  { id:"kent-4", name:"Medway Sensory Swim & Disability Pool", organisation:"Medway Council Leisure", type:"Swimming", location:"Strood", postcode:"ME2 2DT", lat:51.3921, lng:0.4789, description:"Dedicated sensory swim and disability hydrotherapy sessions at Strood Sports Centre. Sensory swim for children 3–12 with games and water confidence building. Hydrotherapy pool with chair hoist. Carer entry free. Website: medway.gov.uk", ageMin:3, ageMax:18, accessibility:["Wheelchair accessible","Hoist available","Hydrotherapy pool","Step-free access","Low-arousal environment","Changing Places toilet"], support:"1:3 (staff to child)", needs:["Autism","Physical disability","Sensory processing","Cerebral palsy","Learning disability","Global development delay"], cost:"£3.65–£4.65 per session (carer free)", funding:["Self-pay","Short Breaks funded"], days:["Saturday","Sunday"], time:"Various — book in advance", contactName:"Strood Sports Centre", contactEmail:"Contact via website", contactPhone:"01634 333933", website:"https://www.medway.gov.uk/info/200307/local_offer/1908/send_activities_2024", factChecked:true, ownerId:"seed" },

  // ─── GLOUCESTERSHIRE ──────────────────────────────────────────────────────
  { id:"glos-1", name:"Of Course We Can Inclusive Short Breaks", organisation:"Active Impact Gloucestershire", type:"Social Skills", location:"Cheltenham", postcode:"GL50 1TH", lat:51.8994, lng:-2.0783, description:"Fun inclusive short breaks for disabled children and young people up to 25, alongside their non-disabled peers in Gloucestershire. Sports, arts, adventure and social activities giving families a vital break. Website: activeimpact.org.uk", ageMin:5, ageMax:25, accessibility:["Wheelchair accessible","Step-free access","Visual timetables","Quiet space"], support:"1:2 (staff to child)", needs:["Physical disability","Autism","Learning disability","ADHD","Sensory processing","Cerebral palsy","Communication difficulties"], cost:"Contact for pricing", funding:["Short Breaks funded","EHCP funded","Charity grants available"], days:["Saturday","Sunday"], time:"Weekends and school holidays", contactName:"Active Impact", contactEmail:"info@activeimpact.org.uk", contactPhone:"Contact via website", website:"https://www.activeimpact.org.uk", factChecked:true, ownerId:"seed" },

  // ─── NORTH SOMERSET & BRISTOL ─────────────────────────────────────────────
  { id:"bristol-1", name:"SENDCAS Clubs & Activities", organisation:"North Somerset Council SENDCAS", type:"Social Skills", location:"Weston-super-Mare", postcode:"BS23 1TH", lat:51.3462, lng:-2.9769, description:"Out-of-school and holiday activities and outings for children with SEND aged 5–18 in North Somerset and Portishead. Activities tailored to individual needs including sports, arts, outings and family stay-and-play sessions during school holidays. Website: n-somerset.gov.uk", ageMin:5, ageMax:18, accessibility:["Wheelchair accessible","Step-free access","Visual timetables","Sensory room","Quiet space"], support:"1:2 (staff to child)", needs:["Autism","Physical disability","Learning disability","ADHD","Global development delay","Communication difficulties","Cerebral palsy"], cost:"Contact for pricing", funding:["Short Breaks funded","EHCP funded"], days:["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"], time:"After school and holidays", contactName:"SENDCAS Team", contactEmail:"sendcas@n-somerset.gov.uk", contactPhone:"01934 426 000", website:"https://n-somerset.gov.uk/my-services/children-young-people-families/send-hub-local-offer/send-hub-leisure-activities-short-breaks", factChecked:true, ownerId:"seed" },
  { id:"bristol-2", name:"Boogie Beats Inclusive Music & Dance", organisation:"Boogie Beats", type:"Music", location:"Weston-super-Mare", postcode:"BS22 8AL", lat:51.3562, lng:-2.9458, description:"Inclusive music and dance sessions for children with additional needs in Weston, Yatton and Somerset. Sessions designed to engage children of all abilities through music, movement and sensory experiences. Website: boogiebeats.co.uk", ageMin:0, ageMax:12, accessibility:["Step-free access","Low-arousal environment","Visual timetables","Sensory room"], support:"1:3 (staff to child)", needs:["Autism","Sensory processing","ADHD","Learning disability","Global development delay","Communication difficulties","Anxiety"], cost:"Contact for pricing", funding:["Self-pay","Short Breaks funded"], days:["Tuesday","Wednesday","Thursday"], time:"Various — see website", contactName:"Boogie Beats Team", contactEmail:"info@boogiebeats.co.uk", contactPhone:"Contact via website", website:"https://www.boogiebeats.co.uk", factChecked:false, ownerId:"seed" },
  { id:"bristol-3", name:"Bristol Inclusive Climbing", organisation:"Bristol Inclusive Climbing", type:"Sports", location:"Bristol", postcode:"BS1 4AQ", lat:51.4545, lng:-2.5879, description:"Inclusive climbing sessions for children and young people with disabilities in Bristol. Adapted techniques and trained instructors make climbing accessible for wheelchair users, those with physical and sensory disabilities, autism and learning difficulties. Website: bristolclimbing.co.uk", ageMin:6, ageMax:25, accessibility:["Wheelchair accessible","Step-free access","Quiet space"], support:"1:3 (staff to child)", needs:["Physical disability","Autism","Learning disability","ADHD","Anxiety","Sensory processing","Cerebral palsy"], cost:"Contact for pricing", funding:["Short Breaks funded","Self-pay"], days:["Saturday","Sunday"], time:"Various — see website", contactName:"Bristol Inclusive Climbing", contactEmail:"inclusive@bristolclimbing.co.uk", contactPhone:"Contact via website", website:"https://www.bristolclimbing.co.uk", factChecked:false, ownerId:"seed" },
  { id:"bristol-4", name:"Urchinwood Manor SEND Horse Riding", organisation:"Urchinwood Manor Riding Centre", type:"Animal Therapy", location:"Congresbury", postcode:"BS49 5AQ", lat:51.3840, lng:-2.8290, description:"RDA-affiliated horse riding sessions for children with SEND at Urchinwood Manor Riding Centre in North Somerset. Therapeutic equine activities adapted to the individual needs of each rider. Website: urchinwoodmanor.co.uk", ageMin:3, ageMax:18, accessibility:["Mounting ramp","Step-free access","Changing facilities","Quiet approach route"], support:"1:1 (staff to child)", needs:["Cerebral palsy","Physical disability","Autism","Learning disability","Anxiety","Sensory processing","Down's syndrome"], cost:"Contact for pricing", funding:["Charity grants available","EHCP funded"], days:["Wednesday","Saturday"], time:"Term time — contact centre", contactName:"Urchinwood Manor", contactEmail:"info@urchinwoodmanor.co.uk", contactPhone:"01934 832 395", website:"https://www.urchinwoodmanor.co.uk", factChecked:false, ownerId:"seed" },

  // ─── WILTSHIRE ────────────────────────────────────────────────────────────
  { id:"wilts-1", name:"Barnardo's Wiltshire Short Breaks", organisation:"Barnardo's Wiltshire", type:"Social Skills", location:"Swindon", postcode:"SN1 1JG", lat:51.5558, lng:-1.7797, description:"Saturday clubs and group activities for children aged 6–18 with SEND across Wiltshire, commissioned by Wiltshire Council. Fun inclusive activities giving families vital short breaks. Website: barnardos.org.uk", ageMin:6, ageMax:18, accessibility:["Wheelchair accessible","Step-free access","Visual timetables","Quiet space"], support:"1:2 (staff to child)", needs:["Autism","Learning disability","Physical disability","ADHD","Communication difficulties","Sensory processing","Global development delay"], cost:"Contact for pricing", funding:["Short Breaks funded","EHCP funded"], days:["Saturday"], time:"Saturdays and school holidays", contactName:"Barnardo's Wiltshire", contactEmail:"wiltshireshortbreaks@barnardos.org.uk", contactPhone:"Contact via website", website:"https://www.barnardos.org.uk/get-support/services/wiltshire-short-breaks-and-positive-activities-service", factChecked:true, ownerId:"seed" },

  // ─── STAFFORDSHIRE ────────────────────────────────────────────────────────
  { id:"staffs-1", name:"Stoke City FC Aiming High Multisport", organisation:"Stoke City FC Foundation", type:"Sports", location:"Stoke-on-Trent", postcode:"ST4 4EG", lat:53.0012, lng:-2.1752, description:"Aiming High sessions delivering two hours of multisport activities in a safe, friendly environment for children with all disabilities. Provides vital respite for parents, guardians and carers. Regular weekly sessions at Stoke City's community facilities. Website: stokecitiyfcfoundation.com", ageMin:5, ageMax:18, accessibility:["Wheelchair accessible","Step-free access","Visual timetables","Quiet space"], support:"1:4 (staff to child)", needs:["Autism","Physical disability","Learning disability","ADHD","Cerebral palsy","Down's syndrome","Communication difficulties"], cost:"Free", funding:["Charity grants available","Fully funded"], days:["Wednesday","Saturday"], time:"Various — see website", contactName:"Stoke City FC Foundation", contactEmail:"foundation@stokecityfc.com", contactPhone:"01782 592255", website:"https://www.stokecityfcfoundation.com", factChecked:true, ownerId:"seed" },
  { id:"staffs-2", name:"Liberty Jamboree Inclusive Youth Service", organisation:"Liberty Jamboree", type:"Social Skills", location:"Lichfield", postcode:"WS13 6QD", lat:52.6836, lng:-1.8286, description:"Inclusive youth service in Lichfield for 8–35 year olds with SEND, SEMH and neurodiverse needs. Wide range of creative, social and activity provisions from arts and drama to sports and outdoor activities. Website: libertyjamboree.co.uk", ageMin:8, ageMax:25, accessibility:["Wheelchair accessible","Step-free access","Visual timetables","Low-arousal environment","Sensory room"], support:"1:2 (staff to child)", needs:["Autism","ADHD","Learning disability","Anxiety","Communication difficulties","Sensory processing"], cost:"Contact for pricing", funding:["Short Breaks funded","Charity grants available"], days:["Saturday","Sunday"], time:"Various — see website", contactName:"Liberty Jamboree", contactEmail:"info@libertyjamboree.co.uk", contactPhone:"Contact via website", website:"https://www.libertyjamboree.co.uk", factChecked:false, ownerId:"seed" },

  // ─── DERBYSHIRE ───────────────────────────────────────────────────────────
  { id:"derby-1", name:"Mid-Derbyshire RDA Horse Riding", organisation:"Mid-Derbyshire Riding for the Disabled", type:"Animal Therapy", location:"Matlock", postcode:"DE4 5JT", lat:53.1418, lng:-1.5580, description:"Therapeutic horse riding for people with additional needs at Red Hill Lane, Tansley, Derbyshire. Friendly horses and dedicated volunteers provide riding therapy for a variety of needs including autism and physical disabilities. Website: northmidlandsrda.org.uk", ageMin:3, ageMax:99, accessibility:["Mounting ramp","Step-free access","Changing facilities"], support:"1:1 (staff to child)", needs:["Physical disability","Cerebral palsy","Autism","Learning disability","Anxiety","ADHD"], cost:"Contact for pricing", funding:["Charity grants available","EHCP funded"], days:["Tuesday","Thursday","Saturday"], time:"Term time — contact group", contactName:"Mid-Derbyshire RDA", contactEmail:"Contact via website", contactPhone:"Contact via website", website:"https://www.northmidlandsrda.org.uk/aboutus", factChecked:false, ownerId:"seed" },
  { id:"derby-2", name:"Scropton RDA Purpose-Built Centre", organisation:"Scropton RDA", type:"Animal Therapy", location:"Derby", postcode:"DE65 5LJ", lat:52.8698, lng:-1.7082, description:"Purpose-built RDA equestrian therapy centre in Scropton, South Derbyshire. Horses and dedicated volunteers offer life-changing therapeutic riding and equine activities to disabled children and adults including riding, horse-care and horse agility. Website: northmidlandsrda.org.uk", ageMin:3, ageMax:99, accessibility:["Wheelchair accessible","Mounting ramp","Step-free access","Changing facilities","Quiet approach route"], support:"1:1 (staff to child)", needs:["Physical disability","Cerebral palsy","Autism","Learning disability","Down's syndrome","ADHD","Anxiety"], cost:"Contact for pricing", funding:["Charity grants available","EHCP funded"], days:["Wednesday","Thursday","Saturday"], time:"Term time — contact centre", contactName:"Scropton RDA", contactEmail:"Contact via website", contactPhone:"Contact via website", website:"https://www.northmidlandsrda.org.uk/aboutus", factChecked:false, ownerId:"seed" },

  // ─── SHROPSHIRE & TELFORD ─────────────────────────────────────────────────
  { id:"shrops-1", name:"Action for Children Shropshire Short Breaks", organisation:"Action for Children Shropshire", type:"Social Skills", location:"Shrewsbury", postcode:"SY1 2RE", lat:52.7080, lng:-2.7540, description:"Community short breaks for disabled children in Shropshire delivering positive, practical and caring activities. Clubs give children access to fun and engaging activities while offering families support and peace of mind. Contract running until 2028. Website: actionforchildren.org.uk", ageMin:5, ageMax:18, accessibility:["Wheelchair accessible","Step-free access","Visual timetables","Quiet space"], support:"1:2 (staff to child)", needs:["Autism","Learning disability","Physical disability","ADHD","Communication difficulties","Global development delay"], cost:"Contact for pricing", funding:["Short Breaks funded","EHCP funded"], days:["Saturday"], time:"Weekends and school holidays", contactName:"Action for Children Shropshire", contactEmail:"shropshire@actionforchildren.org.uk", contactPhone:"Contact via website", website:"https://www.actionforchildren.org.uk/how-we-can-help/our-local-services/find-our-services-near-you/shropshire-community-short-breaks/", factChecked:true, ownerId:"seed" },
  { id:"shrops-2", name:"Wellington Special Swimming Club", organisation:"Wellington Special Swimming Club", type:"Swimming", location:"Telford", postcode:"TF1 1LU", lat:52.6904, lng:-2.5170, description:"Inclusive swimming club for disabled and special needs individuals at Wellington Baths, Telford. Weekly Sunday sessions at just £1 per session. Simply turn up with swimming kit. Welcoming club open to all ages and abilities. Website: shropshire-disability.net", ageMin:3, ageMax:99, accessibility:["Wheelchair accessible","Hoist available","Step-free access","Changing facilities"], support:"1:2 (staff to child)", needs:["Physical disability","Autism","Learning disability","Sensory processing","Cerebral palsy","Down's syndrome"], cost:"£1 per session", funding:["Self-pay"], days:["Sunday"], time:"17:15 – 18:15", contactName:"Wellington Swimming Club", contactEmail:"Contact via website", contactPhone:"Contact via website", website:"https://shropshire-disability.net/venues/", factChecked:false, ownerId:"seed" },
  { id:"shrops-3", name:"ican2 Short Breaks Telford & Wrekin", organisation:"ican2", type:"Social Skills", location:"Telford", postcode:"TF3 4JJ", lat:52.6781, lng:-2.4450, description:"Activities for children and young people in Telford and Wrekin with a disability or additional need, for those who would experience difficulty accessing groups without support. Inclusive activities with trained support workers. Website: telford.gov.uk", ageMin:5, ageMax:18, accessibility:["Wheelchair accessible","Step-free access","Visual timetables"], support:"1:2 (staff to child)", needs:["Autism","Learning disability","Physical disability","ADHD","Communication difficulties","Sensory processing"], cost:"Contact for pricing", funding:["Short Breaks funded","EHCP funded"], days:["Saturday","Sunday"], time:"Weekends and school holidays", contactName:"ican2 Team", contactEmail:"ican2@telford.gov.uk", contactPhone:"01952 385385", website:"https://shropshire-disability.net/venues/", factChecked:true, ownerId:"seed" },

  // ─── WEST MIDLANDS (MORE) ─────────────────────────────────────────────────
  { id:"wmids-4", name:"Midland Mencap Short Breaks Coventry", organisation:"Midland Mencap", type:"Social Skills", location:"Coventry", postcode:"CV1 2GF", lat:52.4068, lng:-1.5197, description:"Short break sessions for children up to 19 in Coventry — weekends, after school and school holidays. Arts and crafts, sport, cycling and community visits. Also supports children to access swimming, youth clubs and hobbies in the community. Website: midlandmencap.org.uk", ageMin:5, ageMax:19, accessibility:["Wheelchair accessible","Step-free access","Visual timetables","Quiet space"], support:"1:2 (staff to child)", needs:["Learning disability","Autism","Physical disability","Down's syndrome","ADHD","Communication difficulties","Global development delay"], cost:"Contact for pricing", funding:["Short Breaks funded","EHCP funded"], days:["Saturday","Sunday"], time:"Weekends, after school, holidays", contactName:"Midland Mencap Coventry", contactEmail:"coventry@midlandmencap.org.uk", contactPhone:"0121 442 2944", website:"https://midlandmencap.org.uk/local-services/coventry/", factChecked:true, ownerId:"seed" },

  // ─── BEDFORDSHIRE & NORTHAMPTONSHIRE ─────────────────────────────────────
  { id:"beds-1", name:"Bedford SEND Inclusive Sports", organisation:"Bedford Borough Council", type:"Sports", location:"Bedford", postcode:"MK40 1UX", lat:52.1361, lng:-0.4667, description:"Bedford's first inclusive club for SEND children 5–18 offering a variety of games and activities. SEND swimming sessions at Kempston Pool and Oasis Beach Pool. Inclusive tennis including wheelchair tennis and sessions for children with learning disabilities, Down's syndrome and autism. Website: bedford.gov.uk", ageMin:5, ageMax:18, accessibility:["Wheelchair accessible","Hoist available","Step-free access","Sensory room"], support:"1:3 (staff to child)", needs:["Autism","Physical disability","Learning disability","ADHD","Down's syndrome","Visual impairment","Sensory processing"], cost:"Contact for pricing", funding:["Short Breaks funded","Self-pay"], days:["Saturday","Sunday"], time:"Various — see website", contactName:"Bedford Borough Sport", contactEmail:"sportsdevelopment@bedford.gov.uk", contactPhone:"01234 276816", website:"https://www.bedford.gov.uk/leisure-parks-and-sport/sports-and-physical-activity/activities-people-special-educational-needs-and-disabilities", factChecked:true, ownerId:"seed" },
  { id:"northants-1", name:"Action for Children Holiday Clubs Northampton", organisation:"Action for Children Northamptonshire", type:"Social Skills", location:"Northampton", postcode:"NN3 8UW", lat:52.2405, lng:-0.8952, description:"Holiday clubs for children with autism, complex health and learning needs at two Northampton locations. Structured environment with nursing care, stimulating activities and a safe respite setting. Website: actionforchildren.org.uk", ageMin:5, ageMax:17, accessibility:["Wheelchair accessible","Step-free access","Sensory room","Visual timetables","Quiet space","Hoist available"], support:"1:1 (staff to child)", needs:["Autism","Learning disability","Physical disability","Global development delay","Communication difficulties","Complex health needs","Cerebral palsy"], cost:"£10 per day", funding:["Short Breaks funded","EHCP funded"], days:["Monday","Tuesday","Wednesday","Thursday"], time:"10:00 – 15:00 (school holidays)", contactName:"Action for Children Northants", contactEmail:"northamptonshire@actionforchildren.org.uk", contactPhone:"03000 271382", website:"https://www.actionforchildren.org.uk/how-we-can-help/our-local-services/", factChecked:true, ownerId:"seed" },

  // ─── CAMBRIDGESHIRE ───────────────────────────────────────────────────────
  { id:"cambs-1", name:"You Can Bike Too Adaptive Cycling", organisation:"You Can Bike Too", type:"Sports", location:"Cambridge", postcode:"CB4 1YS", lat:52.2053, lng:0.1218, description:"Free adaptive and accessible cycling sessions every Sunday at Milton Country Park, Cambridge, from March to November. Adapted bikes for people of all abilities and disabilities. No experience needed. Website: youcanbiketoo.co.uk", ageMin:3, ageMax:99, accessibility:["Wheelchair accessible","Step-free access"], support:"1:2 (staff to child)", needs:["Physical disability","Cerebral palsy","Autism","Learning disability","Visual impairment","Down's syndrome","ADHD"], cost:"Free", funding:["Fully funded"], days:["Sunday"], time:"10:30 – 12:00 (Mar–Nov)", contactName:"You Can Bike Too", contactEmail:"info@youcanbiketoo.co.uk", contactPhone:"Contact via website", website:"https://www.youcanbiketoo.co.uk", factChecked:true, ownerId:"seed" },

  // ─── SUFFOLK ──────────────────────────────────────────────────────────────
  { id:"suffolk-1", name:"Activities Unlimited Suffolk Short Breaks", organisation:"Activities Unlimited Suffolk", type:"Social Skills", location:"Ipswich", postcode:"IP1 2BX", lat:52.0567, lng:1.1482, description:"Short breaks and activity programmes for disabled children and young people across Suffolk. Holiday clubs, after-school activities, sports, arts and social sessions with specialist support. Full activity guide available on the Suffolk Local Offer. Website: suffolklocaloffer.org.uk", ageMin:5, ageMax:18, accessibility:["Wheelchair accessible","Step-free access","Visual timetables","Sensory room","Quiet space"], support:"1:2 (staff to child)", needs:["Autism","Physical disability","Learning disability","ADHD","Sensory processing","Global development delay","Communication difficulties"], cost:"Contact for pricing", funding:["Short Breaks funded","EHCP funded"], days:["Saturday","Sunday"], time:"Weekends and school holidays", contactName:"Activities Unlimited", contactEmail:"activitiesunlimited@suffolk.gov.uk", contactPhone:"0345 606 1499", website:"https://www.suffolklocaloffer.org.uk", factChecked:true, ownerId:"seed" },

  // ─── NORTH EAST (MORE) ────────────────────────────────────────────────────
  { id:"ne-3", name:"Foundation of Light Disability Programmes", organisation:"Foundation of Light Sunderland", type:"Sports", location:"Sunderland", postcode:"SR5 1SU", lat:54.9150, lng:-1.3922, description:"Wide range of disability sport and activity programmes at the Beacon of Light and across Sunderland and County Durham. Fun, exciting sessions developing motor skills, teamwork and confidence. Summer holiday programmes for all children. Website: foundationoflight.co.uk", ageMin:5, ageMax:18, accessibility:["Wheelchair accessible","Step-free access","Visual timetables"], support:"1:3 (staff to child)", needs:["Physical disability","Autism","Learning disability","ADHD","Communication difficulties","Sensory processing"], cost:"Contact for pricing", funding:["Short Breaks funded","Charity grants available"], days:["Saturday","Sunday"], time:"Various — see website", contactName:"Foundation of Light", contactEmail:"info@foundationoflight.co.uk", contactPhone:"0191 563 4046", website:"https://foundationoflight.co.uk", factChecked:true, ownerId:"seed" },
  { id:"ne-4", name:"North East Disability Swimming Club Durham", organisation:"Durham Disability Swimming Club", type:"Swimming", location:"Durham", postcode:"DH1 1SW", lat:54.7765, lng:-1.5740, description:"Inclusive swimming and water-based activities at Freemans Quay Leisure Centre, Durham. Swimming at all experience levels for disabled people of all ages. Competitive swimming options also available. Website: asaner.org.uk", ageMin:5, ageMax:99, accessibility:["Wheelchair accessible","Hoist available","Step-free access","Changing Places toilet"], support:"1:2 (staff to child)", needs:["Physical disability","Autism","Learning disability","Sensory processing","Cerebral palsy","Visual impairment","Hearing impairment"], cost:"Contact for pricing", funding:["Short Breaks funded","Self-pay"], days:["Wednesday","Saturday"], time:"Various — contact club", contactName:"Jo Barber", contactEmail:"jo.barber@asaner.org.uk", contactPhone:"Contact via website", website:"https://www.asaner.org.uk", factChecked:false, ownerId:"seed" },

  // ─── YORKSHIRE (MORE) ─────────────────────────────────────────────────────
  { id:"yorks-4", name:"Shabang! Inclusive Arts West Yorkshire", organisation:"Shabang! Inclusive Learning", type:"Arts & Crafts", location:"Huddersfield", postcode:"HD7 5GW", lat:53.6270, lng:-1.8068, description:"Award-winning inclusive arts charity for learning disabled and neurodivergent children in Slaithwaite, West Yorkshire. Multi-sensory events, regular sessions, music, drama and art workshops in a bespoke renovated space. Serving over 300 families. Website: shabang.org.uk", ageMin:3, ageMax:25, accessibility:["Wheelchair accessible","Step-free access","Sensory room","Low-arousal environment","Visual timetables","Quiet space"], support:"1:2 (staff to child)", needs:["Learning disability","Autism","Down's syndrome","ADHD","Communication difficulties","Sensory processing","Global development delay"], cost:"Contact for pricing", funding:["Charity grants available","Short Breaks funded"], days:["Saturday","Sunday"], time:"Various — see website", contactName:"Shabang! Team", contactEmail:"info@shabang.org.uk", contactPhone:"Contact via website", website:"https://www.shabang.org.uk", factChecked:true, ownerId:"seed" },
  { id:"yorks-5", name:"Yorkshire Sport Inclusive Sports Festival", organisation:"Yorkshire Sport Foundation", type:"Sports", location:"Wakefield", postcode:"WF1 3QP", lat:53.6830, lng:-1.4977, description:"Physical and learning disability sport taster events across Wakefield and Yorkshire. Boccia, wheelchair basketball, athletics, archery and more. Part of the Yorkshire Sport Foundation's inclusive sport programme. Website: yorkshiresport.org", ageMin:5, ageMax:25, accessibility:["Wheelchair accessible","Step-free access"], support:"1:3 (staff to child)", needs:["Physical disability","Learning disability","Autism","Visual impairment","Hearing impairment","Cerebral palsy","ADHD"], cost:"Free", funding:["Charity grants available","Fully funded"], days:["Saturday"], time:"Various events — see website", contactName:"Yorkshire Sport Foundation", contactEmail:"info@yorkshiresport.org", contactPhone:"0113 398 1080", website:"https://www.yorkshiresport.org", factChecked:true, ownerId:"seed" },
  { id:"yorks-6", name:"Growing Works Sprout SEND Outdoor Sessions", organisation:"Growing Works", type:"Nature", location:"Leeds", postcode:"LS6 2EY", lat:53.8138, lng:-1.5649, description:"Outdoor sessions for children and young people with a disability or additional needs alongside their siblings and parent/carers. Nature-based, outdoor learning in safe green spaces across West Yorkshire. Website: growingworks.org.uk", ageMin:3, ageMax:18, accessibility:["Step-free access","Quiet space"], support:"1:3 (staff to child)", needs:["Autism","ADHD","Anxiety","Learning disability","Sensory processing","Communication difficulties","Physical disability"], cost:"Contact for pricing", funding:["Charity grants available","Short Breaks funded"], days:["Wednesday","Saturday"], time:"Various — see website", contactName:"Growing Works Team", contactEmail:"info@growingworks.org.uk", contactPhone:"0113 274 8778", website:"https://www.growingworks.org.uk", factChecked:false, ownerId:"seed" },

  // ─── GREATER MANCHESTER (MORE) ────────────────────────────────────────────
  { id:"manc-4", name:"Disability Sport Manchester", organisation:"Sport Manchester", type:"Sports", location:"Manchester", postcode:"M12 6AP", lat:53.4750, lng:-2.2010, description:"Inclusive sport and physical activity sessions for disabled children and young people across Greater Manchester. Multi-sport, swimming, boccia, wheelchair basketball and more. Linked with the Activity Alliance network of inclusive sport clubs. Website: sportmanchester.co.uk", ageMin:5, ageMax:25, accessibility:["Wheelchair accessible","Step-free access","Changing Places toilet"], support:"1:3 (staff to child)", needs:["Physical disability","Autism","Learning disability","ADHD","Cerebral palsy","Visual impairment","Hearing impairment"], cost:"Contact for pricing", funding:["Short Breaks funded","Charity grants available"], days:["Saturday","Sunday"], time:"Various — see website", contactName:"Sport Manchester", contactEmail:"disability@sportmanchester.co.uk", contactPhone:"0161 224 0100", website:"https://www.sportmanchester.co.uk", factChecked:false, ownerId:"seed" },

  // ─── LONDON (MORE) ────────────────────────────────────────────────────────
  { id:"lon-7", name:"Disability Sports Coach Community Clubs", organisation:"Disability Sports Coach", type:"Sports", location:"London", postcode:"SE1 7PB", lat:51.5045, lng:-0.0865, description:"Free and low-cost inclusive sport sessions for disabled children and young people aged 8+ across London. Boccia, basketball, multi-sport and more. Community-based clubs delivered by trained disability sport coaches. Website: disabilitysportscoach.org.uk", ageMin:8, ageMax:25, accessibility:["Wheelchair accessible","Step-free access","Visual timetables"], support:"1:3 (staff to child)", needs:["Physical disability","Autism","Learning disability","ADHD","Cerebral palsy","Visual impairment","Hearing impairment","Communication difficulties"], cost:"Free or low-cost", funding:["Charity grants available","Fully funded"], days:["Tuesday","Thursday","Saturday"], time:"Various — see website", contactName:"Disability Sports Coach", contactEmail:"dsc@disabilitysportscoach.org.uk", contactPhone:"020 7928 4267", website:"https://www.disabilitysportscoach.org.uk", factChecked:true, ownerId:"seed" },
  { id:"lon-8", name:"Bikeworks All Ability Cycling", organisation:"Bikeworks CIC", type:"Sports", location:"London", postcode:"W10 5LL", lat:51.5210, lng:-0.2193, description:"Exciting adapted cycling at Little Wormwood Scrubs Park using tricycles, side-by-side cycles, wheelchair-platform cycles and recumbents. Free all-ability sessions for disabled children and adults. People with complex needs should be accompanied by a carer. Website: bikeworks.org.uk", ageMin:3, ageMax:99, accessibility:["Wheelchair accessible","Step-free access"], support:"1:2 (staff to child)", needs:["Physical disability","Cerebral palsy","Autism","Learning disability","Visual impairment","Down's syndrome","ADHD"], cost:"Free", funding:["Fully funded"], days:["Saturday","Sunday"], time:"Various — book online", contactName:"Bikeworks", contactEmail:"all.ability@bikeworks.org.uk", contactPhone:"020 8980 7998", website:"https://www.bikeworks.org.uk", factChecked:true, ownerId:"seed" },
  { id:"lon-9", name:"Wormwood Scrubs Pony Centre RDA", organisation:"Wormwood Scrubs Pony Centre", type:"Animal Therapy", location:"London", postcode:"W12 0NS", lat:51.5195, lng:-0.2250, description:"RDA-affiliated pony centre in West London providing therapeutic riding and equine activities for disabled children and adults. Inner-city equestrian therapy in collaboration with the Riding for the Disabled Association. Website: wspc.org.uk", ageMin:3, ageMax:99, accessibility:["Mounting ramp","Step-free access","Changing facilities"], support:"1:1 (staff to child)", needs:["Physical disability","Cerebral palsy","Autism","Learning disability","Anxiety","Down's syndrome","Sensory processing"], cost:"Contact for pricing", funding:["Charity grants available","EHCP funded","Short Breaks funded"], days:["Tuesday","Thursday","Saturday"], time:"Term time — contact centre", contactName:"WSPC Team", contactEmail:"info@wspc.org.uk", contactPhone:"020 8749 5959", website:"https://www.wspc.org.uk", factChecked:true, ownerId:"seed" },
  { id:"lon-10", name:"Graeae Inclusive Theatre Company", organisation:"Graeae Theatre Company", type:"Drama", location:"London", postcode:"N1 6NP", lat:51.5362, lng:-0.1004, description:"One of the UK's biggest disabled-led theatre companies making theatre with disabled artists. Workshops, youth programmes and professional productions featuring actors with physical and sensory impairments. Website: graeae.org", ageMin:14, ageMax:25, accessibility:["Wheelchair accessible","Step-free access","Induction loop","BSL interpreter","Visual timetables"], support:"1:3 (staff to child)", needs:["Physical disability","Visual impairment","Hearing impairment","Cerebral palsy","Communication difficulties","Learning disability"], cost:"Contact for pricing", funding:["Bursary available","Charity grants available"], days:["Saturday"], time:"Various — see website", contactName:"Graeae Team", contactEmail:"info@graeae.org", contactPhone:"020 7613 6900", website:"https://www.graeae.org", factChecked:true, ownerId:"seed" },
  { id:"lon-11", name:"Action for Children Islington Short Breaks", organisation:"Action for Children Islington", type:"Social Skills", location:"London", postcode:"N1 1UN", lat:51.5390, lng:-0.1053, description:"Community-based short breaks for disabled children in Islington supporting children to make friends, connect with their community and enjoy new experiences. Flexible and fun activities tailored to individual needs. Website: actionforchildren.org.uk", ageMin:5, ageMax:18, accessibility:["Wheelchair accessible","Step-free access","Visual timetables","Quiet space"], support:"1:2 (staff to child)", needs:["Autism","Learning disability","Physical disability","ADHD","Communication difficulties","Global development delay"], cost:"Contact for pricing", funding:["Short Breaks funded","EHCP funded"], days:["Saturday","Sunday"], time:"Weekends and school holidays", contactName:"Islington Short Breaks", contactEmail:"islington@actionforchildren.org.uk", contactPhone:"Contact via website", website:"https://www.actionforchildren.org.uk/how-we-can-help/our-local-services/find-our-services-near-you/islington-short-breaks/", factChecked:true, ownerId:"seed" },

  // ─── CORNWALL ─────────────────────────────────────────────────────────────
  { id:"cornwall-1", name:"Calvert Trust Adventure Activities", organisation:"Calvert Trust Cornwall", type:"Sports", location:"Exmoor", postcode:"EX35 6EG", lat:51.1550, lng:-3.8300, description:"Exciting accessible adventure breaks for people with physical, learning, behavioural and sensory disabilities. Activities include rock climbing, kayaking, horse riding, abseiling and more at a stunning accessible activity centre. Website: calvert-trust.org.uk", ageMin:3, ageMax:99, accessibility:["Wheelchair accessible","Hoist available","Step-free access","Changing Places toilet","Sensory room","Quiet space"], support:"1:2 (staff to child)", needs:["Physical disability","Cerebral palsy","Autism","Learning disability","Visual impairment","Hearing impairment","Down's syndrome","Sensory processing"], cost:"Contact for pricing", funding:["Charity grants available","EHCP funded","Short Breaks funded"], days:["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"], time:"Residential and day visits — book ahead", contactName:"Calvert Trust", contactEmail:"info@calvert-trust.org.uk", contactPhone:"01598 763221", website:"https://www.calvert-trust.org.uk", factChecked:true, ownerId:"seed" },

  // ─── LANCASHIRE ───────────────────────────────────────────────────────────
  { id:"lancs-1", name:"Lancashire Disability Sport Inclusive Clubs", organisation:"Lancashire Sport Partnership", type:"Sports", location:"Preston", postcode:"PR1 2HE", lat:53.7632, lng:-2.7031, description:"Inclusive sport sessions for disabled children and young people across Lancashire. Multi-sport, boccia, swimming, wheelchair basketball and athletics. Lancashire Sport Partnership works with clubs to create accessible opportunities county-wide. Website: lancashiresport.org.uk", ageMin:5, ageMax:25, accessibility:["Wheelchair accessible","Step-free access"], support:"1:3 (staff to child)", needs:["Physical disability","Autism","Learning disability","ADHD","Cerebral palsy","Visual impairment"], cost:"Contact for pricing", funding:["Charity grants available","Short Breaks funded"], days:["Saturday","Sunday"], time:"Various — see website", contactName:"Lancashire Sport Partnership", contactEmail:"info@lancashiresport.org.uk", contactPhone:"01772 534039", website:"https://www.lancashiresport.org.uk", factChecked:false, ownerId:"seed" },

  // ─── CUMBRIA ──────────────────────────────────────────────────────────────
  { id:"cumbria-1", name:"Calvert Lake District Adventure Centre", organisation:"Calvert Trust Exmoor", type:"Sports", location:"Keswick", postcode:"CA12 4QD", lat:54.5993, lng:-3.1323, description:"Accessible activity centre in the Lake District for people with disabilities. Kayaking, canoeing, rock climbing and outdoor activities in stunning Cumbrian landscape. Established charity bringing adventure to everyone regardless of disability. Website: calvert-trust.org.uk", ageMin:3, ageMax:99, accessibility:["Wheelchair accessible","Hoist available","Step-free access","Changing facilities","Sensory room"], support:"1:2 (staff to child)", needs:["Physical disability","Cerebral palsy","Autism","Learning disability","Visual impairment","Hearing impairment","Sensory processing"], cost:"Contact for pricing", funding:["Charity grants available","EHCP funded","Short Breaks funded"], days:["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"], time:"Residential and day visits — book ahead", contactName:"Calvert Trust Lake District", contactEmail:"enquiries@calvert-trust.org.uk", contactPhone:"017687 72254", website:"https://www.calvert-trust.org.uk/lake-district", factChecked:true, ownerId:"seed" },

  // ─── EAST MIDLANDS (MORE) ─────────────────────────────────────────────────
  { id:"emids-3", name:"Leicestershire & Rutland KIDS Charity", organisation:"KIDS Charity East Midlands", type:"Social Skills", location:"Leicester", postcode:"LE1 7GH", lat:52.6369, lng:-1.1398, description:"Holiday play schemes and activity sessions for disabled children across Leicestershire. Short break support giving disabled children a chance to socialise, try new activities and develop independence. Website: kids.org.uk", ageMin:5, ageMax:18, accessibility:["Wheelchair accessible","Step-free access","Visual timetables","Sensory room"], support:"1:2 (staff to child)", needs:["Physical disability","Autism","Learning disability","Cerebral palsy","Global development delay","Communication difficulties","Down's syndrome"], cost:"Contact for pricing", funding:["Short Breaks funded","EHCP funded"], days:["Monday","Tuesday","Wednesday","Thursday","Friday"], time:"School holidays", contactName:"KIDS East Midlands", contactEmail:"eastmidlands@kids.org.uk", contactPhone:"0116 273 5850", website:"https://www.kids.org.uk", factChecked:true, ownerId:"seed" },

  // ─── WALES (MORE) ─────────────────────────────────────────────────────────
  { id:"wales-4", name:"Mencap Cymru Gateway Clubs", organisation:"Mencap Cymru", type:"Social Skills", location:"Newport", postcode:"NP20 1GG", lat:51.5882, lng:-2.9977, description:"Gateway leisure and social clubs for children and young people with learning disabilities across South Wales. Arts, sports and social activities in Newport and across Welsh regions. Website: mencap.org.uk", ageMin:6, ageMax:25, accessibility:["Wheelchair accessible","Step-free access","Visual timetables"], support:"1:3 (staff to child)", needs:["Learning disability","Autism","Down's syndrome","Communication difficulties","Physical disability"], cost:"Contact for pricing", funding:["Short Breaks funded","Charity grants available"], days:["Saturday"], time:"Various — see website", contactName:"Mencap Cymru Newport", contactEmail:"wales@mencap.org.uk", contactPhone:"029 2074 7588", website:"https://www.mencap.org.uk/about-us/wales", factChecked:true, ownerId:"seed" },
  { id:"wales-5", name:"Calvert Trust Wales Aberdovey", organisation:"Calvert Trust Wales", type:"Sports", location:"Aberdyfi", postcode:"LL35 0ED", lat:52.5430, lng:-4.0570, description:"Accessible outdoor activity centre in Snowdonia for disabled people of all ages. Sailing, kayaking, climbing, horse riding and more in a stunning Welsh coastal setting. Purpose-built accessible facilities throughout. Website: calvert-trust.org.uk", ageMin:3, ageMax:99, accessibility:["Wheelchair accessible","Hoist available","Step-free access","Changing facilities","Sensory room"], support:"1:2 (staff to child)", needs:["Physical disability","Cerebral palsy","Autism","Learning disability","Visual impairment","Hearing impairment","Sensory processing","Down's syndrome"], cost:"Contact for pricing", funding:["Charity grants available","EHCP funded","Short Breaks funded"], days:["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"], time:"Residential and day visits — book ahead", contactName:"Calvert Trust Wales", contactEmail:"wales@calvert-trust.org.uk", contactPhone:"01654 767464", website:"https://www.calvert-trust.org.uk/wales", factChecked:true, ownerId:"seed" },

  // ─── SCOTLAND (MORE) ──────────────────────────────────────────────────────
  { id:"scot-4", name:"Calvert Trust Kielder Scotland", organisation:"Calvert Trust Kielder", type:"Sports", location:"Hexham", postcode:"NE48 1BS", lat:55.1700, lng:-2.2390, description:"Accessible adventure centre near the Scottish border in the Kielder Forest. Outdoor activities including sailing, kayaking, rock climbing and horse riding for disabled people of all ages. Purpose-built accessible facilities. Website: calvert-trust.org.uk", ageMin:3, ageMax:99, accessibility:["Wheelchair accessible","Hoist available","Step-free access","Changing facilities","Sensory room"], support:"1:2 (staff to child)", needs:["Physical disability","Cerebral palsy","Autism","Learning disability","Visual impairment","Hearing impairment","Sensory processing"], cost:"Contact for pricing", funding:["Charity grants available","EHCP funded","Short Breaks funded"], days:["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"], time:"Residential and day visits — book ahead", contactName:"Calvert Trust Kielder", contactEmail:"enquiries@calvert-trust.org.uk", contactPhone:"01434 250232", website:"https://www.calvert-trust.org.uk/kielder", factChecked:true, ownerId:"seed" },
  { id:"scot-5", name:"Riding for Disabled Scotland Groups", organisation:"RDA Scotland", type:"Animal Therapy", location:"Perth", postcode:"PH1 1BE", lat:56.3950, lng:-3.4312, description:"RDA Scotland has multiple groups providing therapeutic horse riding for disabled children and adults across Scotland. Physical, sensory and learning disabilities, autism and ADHD all supported. Use the RDA group finder to find your nearest Scottish group. Website: rda.org.uk", ageMin:3, ageMax:99, accessibility:["Mounting ramp","Step-free access","Changing facilities"], support:"1:1 (staff to child)", needs:["Physical disability","Cerebral palsy","Autism","Learning disability","Anxiety","Down's syndrome","ADHD"], cost:"Contact local group", funding:["Charity grants available","EHCP funded","Self-pay"], days:["Wednesday","Thursday","Saturday"], time:"Term time — contact local group", contactName:"RDA Scotland", contactEmail:"scotland@rda.org.uk", contactPhone:"02476 696510", website:"https://rda.org.uk/rda-groups/", factChecked:true, ownerId:"seed" },


  // ─── SURREY MAINSTREAM VENUES WITH SEND/SENSORY SESSIONS ────────────────────
  {
    id:"ms-surrey-1", name:"SEND Leisure Pool Sessions", organisation:"Guildford Spectrum (Freedom Leisure)", type:"Swimming",
    location:"Guildford", postcode:"GU1 1SB", lat:51.2480, lng:-0.5820,
    description:"Guildford Spectrum's dedicated SEND Leisure Pool sessions offer a quieter, more supportive environment for children with additional needs. The huge leisure pool has a wave machine, waterslides and interactive water features. Not a specialist disability centre — this is a mainstream leisure complex offering specific SEND sessions. Website: freedom-leisure.co.uk/centres/guildford-spectrum-leisure-complex",
    ageMin:0, ageMax:18, accessibility:["Wheelchair accessible","Step-free access","Changing Places toilet","Hoist available"],
    support:"Varies by need", needs:["Autism","ADHD","Sensory processing","Learning disability","Anxiety","Physical disability"],
    cost:"Standard admission applies", funding:["Self-pay","DLA accepted"],
    days:["Saturday","Sunday"], time:"Check timetable — contact centre",
    contactName:"Guildford Spectrum", contactEmail:"guildford.spectrum@freedom-leisure.co.uk", contactPhone:"01483 443322",
    website:"https://www.freedom-leisure.co.uk/centres/guildford-spectrum-leisure-complex/", factChecked:true, ownerId:"seed"
  },
  {
    id:"ms-surrey-2", name:"SEND Casual Swimming Sessions", organisation:"Eastwood Leisure Centre (Freedom Leisure)", type:"Swimming",
    location:"Woking", postcode:"GU21 5RF", lat:51.3250, lng:-0.5510,
    description:"Dedicated SEND casual swimming sessions every Wednesday evening at Eastwood Leisure Centre, Woking. Not a specialist disability service — this is a mainstream leisure centre offering a specific weekly session for children with special educational needs. Children must be accompanied in the pool by a parent or carer. Website: freedom-leisure.co.uk",
    ageMin:0, ageMax:18, accessibility:["Wheelchair accessible","Step-free access","Hoist available"],
    support:"Varies by need", needs:["Autism","ADHD","Sensory processing","Learning disability","Physical disability","Anxiety"],
    cost:"Contact for pricing", funding:["Self-pay","DLA accepted"],
    days:["Wednesday"], time:"17:00 – 18:00",
    contactName:"Eastwood Leisure Centre", contactEmail:"activecommwoking@freedom-leisure.co.uk", contactPhone:"01932 960994",
    website:"https://www.surreycc.gov.uk/children/support-and-advice/families/directory/e/eastwood-leisure-centre-send-casual-swimming-sessions", factChecked:true, ownerId:"seed"
  },
  {
    id:"ms-surrey-3", name:"Surrey Heath Family Centre Sensory Space", organisation:"Surrey Heath Family Centre (Barnardo's)", type:"Sensory",
    location:"Camberley", postcode:"GU15 4AF", lat:51.3361, lng:-0.7436,
    description:"Free 45-minute sensory space sessions every Friday at Surrey Heath Young People and Family Centre. A calm, equipped sensory room available to any family — no diagnosis needed. Not exclusive to disabled children. Also runs Play with Me sessions every Tuesday and Healthy Baby Clinics. Website: barnardosfamilycentressurrey.org.uk",
    ageMin:0, ageMax:11, accessibility:["Wheelchair accessible","Step-free access","Sensory room","Quiet space"],
    support:"Varies by need", needs:["Autism","Sensory processing","Anxiety","Global development delay","Communication difficulties","ADHD"],
    cost:"Free", funding:["Fully funded"],
    days:["Friday"], time:"Book a free 45-minute slot — contact centre",
    contactName:"Surrey Heath Family Centre", contactEmail:"surreyheathfamilycentre@barnados.org.uk", contactPhone:"01276 462897",
    website:"https://www.barnardosfamilycentressurrey.org.uk/surrey-heath-family-centre", factChecked:true, ownerId:"seed"
  },
  {
    id:"ms-surrey-4", name:"Sensory Room — Spelthorne Family Centre", organisation:"Stanwell Family Centre", type:"Sensory",
    location:"Staines", postcode:"TW19 7HE", lat:51.4489, lng:-0.5028,
    description:"Free sensory room at Stanwell Family Centre, open Monday to Friday at various times. A safe, calm space for children up to age 11. Features bubble tubes, glitter balls, tactile panels, interactive light and sound panels, a water bed and projected moving images. Not for disabled children only — open to any family who would benefit. Website: surreycc.gov.uk",
    ageMin:0, ageMax:11, accessibility:["Wheelchair accessible","Step-free access","Sensory room","Quiet space"],
    support:"Varies by need", needs:["Autism","Sensory processing","Visual impairment","Hearing impairment","Anxiety","ADHD","Global development delay"],
    cost:"Free", funding:["Fully funded"],
    days:["Monday","Tuesday","Wednesday","Thursday","Friday"], time:"Various — contact centre",
    contactName:"Stanwell Family Centre", contactEmail:"Contact via Surrey CC", contactPhone:"Contact via Surrey CC",
    website:"https://familyinformationdirectory.surreycc.gov.uk/kb5/surrey/fsd/shortlist.page?action=LOOKUP&id=Ras4c3RUYkk", factChecked:true, ownerId:"seed"
  },
  {
    id:"ms-surrey-5", name:"Spelthorne Disability Sports Club", organisation:"Spelthorne Disability Sports Club", type:"Sports",
    location:"Staines", postcode:"TW18 1AJ", lat:51.4327, lng:-0.5057,
    description:"Inclusive sports sessions for young people aged 5–25 and their siblings at Spelthorne Leisure Centre. Wide range of sports plus sport-specific coaching. Not exclusively for disabled children — siblings always welcome. Sessions run by enthusiastic volunteers with parents encouraged to stay. First session free, no booking needed. Website: surreycc.gov.uk",
    ageMin:5, ageMax:25, accessibility:["Wheelchair accessible","Step-free access"],
    support:"1:4 (staff to child)", needs:["Physical disability","Learning disability","Autism","ADHD","Cerebral palsy","Down's syndrome"],
    cost:"Free first session — contact for membership", funding:["Self-pay","Charity grants available"],
    days:["Saturday","Sunday"], time:"Contact centre — first session free",
    contactName:"Spelthorne Disability Sports Club", contactEmail:"Contact via Surrey CC", contactPhone:"Contact via Surrey CC",
    website:"https://familyinformationdirectory.surreycc.gov.uk/kb5/surrey/fsd/shortlist.page?action=LOOKUP&id=Ras4c3RUYkk", factChecked:true, ownerId:"seed"
  },
  {
    id:"ms-surrey-6", name:"Sproglets SEN Play Sessions", organisation:"Sproglets Playcentre", type:"Sensory",
    location:"Guildford", postcode:"GU3 2AH", lat:51.2290, lng:-0.6510,
    description:"Mainstream indoor play centre for 0–5 year olds in Normandy, near Guildford with dedicated SEN sessions every Tuesday and Thursday at 1pm. Includes role play, sensory soft play and more in a safe, warm environment. Open Monday to Friday — not exclusively for SEND families but SEN sessions are quieter and slower-paced. Note: please confirm this centre is still open before visiting — recommend calling ahead. Website: surreycc.gov.uk",
    ageMin:0, ageMax:5, accessibility:["Step-free access","Quiet space","Sensory room"],
    support:"Varies by need", needs:["Autism","Sensory processing","ADHD","Global development delay","Anxiety","Communication difficulties"],
    cost:"Contact for pricing", funding:["Self-pay"],
    days:["Tuesday","Thursday"], time:"SEN sessions: 13:00 (also open Mon–Fri generally)",
    contactName:"Sproglets Playcentre", contactEmail:"sprogletsplaycentre@outlook.com", contactPhone:"07712 472211",
    website:"https://www.surreycc.gov.uk/children/support-and-advice/families/directory/s/sproglets-playcentre-including-sen-sessions", factChecked:false, ownerId:"seed"
  },
  {
    id:"ms-surrey-7", name:"Small + Mighty Sensory Play Café", organisation:"Small + Mighty Club", type:"Sensory",
    location:"Godalming", postcode:"GU7 1DS", lat:51.1866, lng:-0.6038,
    description:"Surrey's modern sensory play café on Godalming High Street. Six immersive play zones including an interactive floor projector, Scandinavian timber play frame, sensory baby zone, multi-player touchscreen games and role play area. A mainstream café-play space open to all families — not disability-specific but with a sensory-rich design throughout. Website: smallandmighty.club",
    ageMin:0, ageMax:6, accessibility:["Step-free access","Sensory room","Low-arousal environment"],
    support:"Varies by need", needs:["Autism","Sensory processing","ADHD","Anxiety","Global development delay"],
    cost:"Contact for session prices", funding:["Self-pay"],
    days:["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"], time:"Various sessions — see website",
    contactName:"Small + Mighty", contactEmail:"hello@smallandmighty.club", contactPhone:"Contact via website",
    website:"https://smallandmighty.club/", factChecked:true, ownerId:"seed"
  },
  {
    id:"ms-surrey-8", name:"Let's Pretend Role Play & Sensory Barn", organisation:"Let's Pretend at Priory Farm", type:"Sensory",
    location:"Nutfield", postcode:"RH1 4EJ", lat:51.2171, lng:-0.1640,
    description:"Indoor role play barn at Priory Farm, Nutfield with ten themed play areas including a dedicated sensory area for younger children. Supermarket, café, farm, vets, doctors, theatre, construction site and salon — all with dress-up costumes. A mainstream children's venue open to all families, not disability-specific, but the sensory zone and calm layout makes it popular with SEND families. Website: letspretendplay.com",
    ageMin:0, ageMax:10, accessibility:["Step-free access","Sensory room","Quiet space"],
    support:"Varies by need", needs:["Autism","Sensory processing","ADHD","Anxiety","Learning disability"],
    cost:"From £9.95 per child, £2.50 adult", funding:["Self-pay"],
    days:["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"], time:"Three sessions daily — check website",
    contactName:"Let's Pretend", contactEmail:"Contact via website", contactPhone:"Contact via website",
    website:"https://letspretendplay.com/", factChecked:false, ownerId:"seed"
  },
  {
    id:"ms-surrey-9", name:"Surrey Sports Park Inclusive Swimming", organisation:"Surrey Sports Park (University of Surrey)", type:"Swimming",
    location:"Guildford", postcode:"GU2 7AD", lat:51.2432, lng:-0.5893,
    description:"Surrey's only indoor Olympic-sized pool at the University of Surrey campus, open to members and non-members. Accessible facilities including graduated access, ramps and aquatic wheelchairs. Not disability-specific but offers accessible swimming and lessons. Swim England inclusive programme for all abilities. Website: surreysportspark.co.uk",
    ageMin:0, ageMax:99, accessibility:["Wheelchair accessible","Step-free access","Hoist available","Changing facilities"],
    support:"Varies by need", needs:["Physical disability","Autism","Sensory processing","Cerebral palsy","Learning disability"],
    cost:"Member rates and pay-as-you-go — contact centre", funding:["Self-pay","DLA accepted"],
    days:["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"], time:"Various — check timetable",
    contactName:"Surrey Sports Park", contactEmail:"info@surreysportspark.co.uk", contactPhone:"01483 689111",
    website:"https://surreysportspark.co.uk/swimming", factChecked:false, ownerId:"seed"
  },
  {
    id:"ms-surrey-10", name:"The Hen House Soft Play Café", organisation:"The Hen House", type:"Sensory",
    location:"Haslemere", postcode:"GU27 2AX", lat:51.0895, lng:-0.7084,
    description:"Welcoming soft play café in Haslemere town centre for children aged 0–8, open 7 days a week until 5pm. Separate baby and older children's play areas plus an activity room for sensory fun. Relaxed, unhurried sessions — no rushing. Not disability-specific but well-suited to SEND families thanks to its calm layout and extended session times. Website: thehen-house.com",
    ageMin:0, ageMax:8, accessibility:["Step-free access","Quiet space","Low-arousal environment"],
    support:"Varies by need", needs:["Autism","Sensory processing","ADHD","Anxiety","Global development delay"],
    cost:"From £7 per child — contact for pricing", funding:["Self-pay"],
    days:["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"], time:"09:00 – 15:00 and 15:30 – 17:00",
    contactName:"The Hen House", contactEmail:"Contact via website", contactPhone:"Contact via website",
    website:"https://thehen-house.com/soft-play-cafe/", factChecked:false, ownerId:"seed"
  },

  // ─── THERAPIES ────────────────────────────────────────────────────────────
  { id:"therapy-1", category:"therapy", name:"Aquatic Therapy — White Lodge Centre", organisation:"White Lodge Centre", type:"Therapy", location:"Chertsey", postcode:"KT16 0FA", lat:51.3865, lng:-0.5065, description:"Specialist hydrotherapy in a purpose-built warm water pool for children with physical and neurological conditions. Delivered by qualified physiotherapists and hydrotherapy specialists. Referral via GP or physio. Website: whitelodgecentre.co.uk", ageMin:0, ageMax:18, accessibility:["Wheelchair accessible","Hoist available","Hydrotherapy pool","Step-free access","Changing Places toilet"], support:"1:1 (staff to child)", needs:["Cerebral palsy","Physical disability","Global development delay","Learning disability","Autism"], cost:"Contact for pricing", funding:["EHCP funded","Short Breaks funded","NHS referral"], days:["Monday","Tuesday","Wednesday","Thursday","Friday"], time:"By appointment", contactName:"White Lodge Therapy Team", contactEmail:"info@whitelodgecentre.co.uk", contactPhone:"01932 567131", website:"https://www.whitelodgecentre.co.uk/what-we-do/early-years/child-therapy", factChecked:true, ownerId:"seed" },
  { id:"therapy-2", category:"therapy", name:"Speech & Language Therapy Group", organisation:"Surrey and Borders Partnership NHS", type:"Therapy", location:"Guildford", postcode:"GU2 7XX", lat:51.2362, lng:-0.5704, description:"Group speech and language therapy sessions for children with communication difficulties, autism and developmental language disorder. NHS-funded therapy delivered by qualified SaLTs. Referral via GP or health visitor. Website: sabp.nhs.uk", ageMin:0, ageMax:18, accessibility:["Wheelchair accessible","Step-free access","Visual timetables","Low-arousal environment"], support:"1:4 (staff to child)", needs:["Communication difficulties","Autism","Learning disability","Hearing impairment","Global development delay"], cost:"Free (NHS)", funding:["NHS referral","Fully funded"], days:["Monday","Tuesday","Wednesday","Thursday","Friday"], time:"By appointment", contactName:"SABP Children's SaLT", contactEmail:"sabp.childrenstherapy@nhs.net", contactPhone:"0300 5555 222", website:"https://www.sabp.nhs.uk/our-services/children-young-people/speech-language-therapy", factChecked:true, ownerId:"seed" },
  { id:"therapy-3", category:"therapy", name:"Occupational Therapy for Children", organisation:"Surrey County Council OT", type:"Therapy", location:"Guildford", postcode:"GU1 4LZ", lat:51.2395, lng:-0.5703, description:"Occupational therapy assessments and sessions for children with physical disabilities, developmental delay and sensory processing difficulties. Support with daily living skills, school participation and sensory integration. Referral via GP or school. Website: surreycc.gov.uk", ageMin:0, ageMax:18, accessibility:["Wheelchair accessible","Step-free access"], support:"1:1 (staff to child)", needs:["Physical disability","Cerebral palsy","Sensory processing","Learning disability","Global development delay","Autism","ADHD"], cost:"Free (NHS/council funded)", funding:["NHS referral","EHCP funded","Fully funded"], days:["Monday","Tuesday","Wednesday","Thursday","Friday"], time:"By appointment", contactName:"Surrey CC Children's OT", contactEmail:"Contact via GP/school", contactPhone:"0300 470 9100", website:"https://www.surreycc.gov.uk/children/support-and-advice/local-offer/parents-and-carers/health-and-wellbeing/occupational-therapy", factChecked:true, ownerId:"seed" },
  { id:"therapy-4", category:"therapy", name:"Music Therapy — Individual Sessions", organisation:"nordoff robbins", type:"Music", location:"London", postcode:"NW5 3BJ", lat:51.5520, lng:-0.1385, description:"One-to-one music therapy for children with autism, learning disabilities, physical and mental health challenges. Sessions use improvised music to build communication, emotional wellbeing and confidence. UK's largest music therapy charity. Website: nordoff-robbins.org.uk", ageMin:0, ageMax:25, accessibility:["Wheelchair accessible","Step-free access","Low-arousal environment"], support:"1:1 (staff to child)", needs:["Autism","Learning disability","Communication difficulties","Anxiety","ADHD","Physical disability","Sensory processing"], cost:"Contact for pricing — bursaries available", funding:["Bursary available","Charity grants available","Self-pay"], days:["Monday","Tuesday","Wednesday","Thursday","Friday"], time:"By appointment", contactName:"Nordoff Robbins", contactEmail:"info@nordoff-robbins.org.uk", contactPhone:"020 7267 4496", website:"https://www.nordoff-robbins.org.uk", factChecked:true, ownerId:"seed" },
  { id:"therapy-5", category:"therapy", name:"Art Therapy for Children with SEND", organisation:"British Association of Art Therapists", type:"Therapy", location:"Nationwide UK", postcode:"EC2A 4QH", lat:51.5225, lng:-0.0866, description:"Find accredited art therapists working with children with SEND, autism, trauma and mental health challenges across the UK. Art therapy uses creative expression to improve emotional wellbeing, communication and self-esteem. Use the BAAT therapist finder on their website. Website: baat.org", ageMin:3, ageMax:25, accessibility:["Varies by therapist"], support:"1:1 (staff to child)", needs:["Autism","ADHD","Anxiety","Learning disability","Communication difficulties","Sensory processing","Cerebral palsy"], cost:"Contact individual therapist", funding:["Self-pay","Bursary available","EHCP funded"], days:["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"], time:"By appointment", contactName:"BAAT", contactEmail:"info@baat.org", contactPhone:"020 7686 4216", website:"https://www.baat.org", factChecked:true, ownerId:"seed" },
  { id:"therapy-6", category:"therapy", name:"Animal Assisted Therapy — Canine Concern", organisation:"Canine Concern", type:"Animal Therapy", location:"Nationwide UK", postcode:"SG14 2EE", lat:51.7953, lng:-0.0780, description:"Therapeutic dog visits and animal-assisted sessions for children with disabilities, autism and special needs across the UK. Registered therapy dogs visit schools, hospitals and community settings. Find your local Canine Concern group via their website. Website: canineconcern.org.uk", ageMin:0, ageMax:99, accessibility:["Varies by location"], support:"1:3 (staff to child)", needs:["Autism","Anxiety","Learning disability","Physical disability","Communication difficulties","ADHD","Sensory processing"], cost:"Contact local group", funding:["Charity grants available"], days:["Various"], time:"Contact local group", contactName:"Canine Concern National", contactEmail:"info@canineconcern.org.uk", contactPhone:"Contact via website", website:"https://www.canineconcern.org.uk", factChecked:true, ownerId:"seed" },
  { id:"therapy-7", category:"therapy", name:"Physiotherapy for Disabled Children", organisation:"Surrey and Borders NHS Children's Physio", type:"Therapy", location:"Surrey", postcode:"GU2 7XX", lat:51.2432, lng:-0.5893, description:"Children's physiotherapy for physical disabilities, developmental delay, cerebral palsy and neurological conditions across Surrey. NHS-funded community physio, home visits and clinic sessions. Referral via GP, health visitor or paediatrician. Website: sabp.nhs.uk", ageMin:0, ageMax:18, accessibility:["Wheelchair accessible","Home visits available","Step-free access"], support:"1:1 (staff to child)", needs:["Cerebral palsy","Physical disability","Global development delay","Down's syndrome","Muscular conditions"], cost:"Free (NHS)", funding:["NHS referral","Fully funded"], days:["Monday","Tuesday","Wednesday","Thursday","Friday"], time:"By appointment", contactName:"SABP Children's Physio", contactEmail:"sabp.childrenstherapy@nhs.net", contactPhone:"0300 5555 222", website:"https://www.sabp.nhs.uk/our-services/children-young-people/physiotherapy", factChecked:true, ownerId:"seed" },
  { id:"therapy-8", category:"therapy", name:"Sensory Integration Therapy", organisation:"SIUK — Sensory Integration Network", type:"Sensory", location:"Nationwide UK", postcode:"NN3 8RF", lat:52.2405, lng:-0.8952, description:"Sensory integration therapy for children with autism, ADHD, developmental coordination disorder and sensory processing challenges. Use the SIUK therapist directory to find a qualified SI therapist near you. Website: sensoryintegration.org.uk", ageMin:0, ageMax:18, accessibility:["Varies by therapist"], support:"1:1 (staff to child)", needs:["Autism","Sensory processing","ADHD","Anxiety","Learning disability","Global development delay","Communication difficulties"], cost:"Contact individual therapist", funding:["Self-pay","EHCP funded","Bursary available"], days:["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"], time:"By appointment", contactName:"SIUK", contactEmail:"info@sensoryintegration.org.uk", contactPhone:"Contact via website", website:"https://www.sensoryintegration.org.uk", factChecked:true, ownerId:"seed" },

  // ─── CHARITIES ────────────────────────────────────────────────────────────
  { id:"charity-1", category:"charity", name:"Ambitious About Autism", organisation:"Ambitious About Autism", type:"Social Skills", location:"London", postcode:"N10 3JA", lat:51.5949, lng:-0.1521, description:"National charity for autistic children and young people providing education, support and campaigning. Runs autism schools, youth programmes, family support and the UK's first autism employment service. Free resources and helpline for families. Website: ambitiousaboutautism.org.uk", ageMin:0, ageMax:25, accessibility:["Wheelchair accessible","Step-free access","Low-arousal environment","Visual timetables"], support:"Varies", needs:["Autism","ADHD","Communication difficulties","Anxiety","Sensory processing"], cost:"Free — charity services", funding:["Fully funded","Charity grants available"], days:["Monday","Tuesday","Wednesday","Thursday","Friday"], time:"Contact charity — various services", contactName:"Ambitious About Autism", contactEmail:"info@ambitiousaboutautism.org.uk", contactPhone:"020 8815 5444", website:"https://www.ambitiousaboutautism.org.uk", factChecked:true, ownerId:"seed" },
  { id:"charity-2", category:"charity", name:"National Autistic Society", organisation:"National Autistic Society", type:"Social Skills", location:"Nationwide UK", postcode:"N1 9XN", lat:51.5342, lng:-0.1027, description:"The UK's leading charity for autistic people. Provides information, support, training and services. Runs autism schools, diagnosis support, helpline, local branches and youth clubs across the UK. Helpline: 0808 800 4104. Website: autism.org.uk", ageMin:0, ageMax:99, accessibility:["Varies by service"], support:"Varies", needs:["Autism","ADHD","Communication difficulties","Anxiety","Sensory processing","Learning disability"], cost:"Free helpline — services vary", funding:["Charity grants available","Fully funded"], days:["Monday","Tuesday","Wednesday","Thursday","Friday"], time:"Helpline Mon–Fri 10:00–16:00", contactName:"NAS Helpline", contactEmail:"helpline@nas.org.uk", contactPhone:"0808 800 4104", website:"https://www.autism.org.uk", factChecked:true, ownerId:"seed" },
  { id:"charity-3", category:"charity", name:"Mencap — Learning Disability Support", organisation:"Royal Mencap Society", type:"Social Skills", location:"Nationwide UK", postcode:"EC1Y 8TT", lat:51.5242, lng:-0.0939, description:"The UK's leading charity for people with learning disabilities. Provides advice, support services, leisure clubs, employment support and campaigns for equal rights. Family helpline and local services across England, Wales and Northern Ireland. Website: mencap.org.uk", ageMin:0, ageMax:99, accessibility:["Wheelchair accessible","Step-free access","Visual timetables"], support:"Varies", needs:["Learning disability","Down's syndrome","Autism","Communication difficulties","Physical disability","Global development delay"], cost:"Free helpline — services vary", funding:["Charity grants available","Short Breaks funded","EHCP funded"], days:["Monday","Tuesday","Wednesday","Thursday","Friday"], time:"Helpline Mon–Fri 09:00–17:00", contactName:"Mencap Helpline", contactEmail:"help@mencap.org.uk", contactPhone:"0808 808 1111", website:"https://www.mencap.org.uk", factChecked:true, ownerId:"seed" },
  { id:"charity-4", category:"charity", name:"Scope — Disability Equality Charity", organisation:"Scope", type:"Social Skills", location:"Nationwide UK", postcode:"EC2Y 8AS", lat:51.5211, lng:-0.0920, description:"Leading disability equality charity campaigning for a world where disabled people have equal opportunities. Provides practical support, employment help, online community and free helpline for families of disabled children. Website: scope.org.uk", ageMin:0, ageMax:99, accessibility:["Varies"], support:"Varies", needs:["Physical disability","Cerebral palsy","Learning disability","Autism","Communication difficulties","Visual impairment","Hearing impairment"], cost:"Free helpline — services vary", funding:["Charity grants available","Fully funded"], days:["Monday","Tuesday","Wednesday","Thursday","Friday"], time:"Helpline Mon–Fri 08:00–18:00, Sat 10:00–14:00", contactName:"Scope Helpline", contactEmail:"helpline@scope.org.uk", contactPhone:"0808 800 3333", website:"https://www.scope.org.uk", factChecked:true, ownerId:"seed" },
  { id:"charity-5", category:"charity", name:"Contact — Family Support for Disability", organisation:"Contact (formerly Contact a Family)", type:"Social Skills", location:"Nationwide UK", postcode:"EC1V 3SJ", lat:51.5264, lng:-0.0975, description:"National charity for families with disabled children providing information, advice and support. Free helpline for families navigating diagnosis, benefits, education and more. Connects families with similar experiences and runs events across the UK. Website: contact.org.uk", ageMin:0, ageMax:25, accessibility:["Varies"], support:"Varies", needs:["All disabilities and conditions"], cost:"Free", funding:["Fully funded","Charity grants available"], days:["Monday","Tuesday","Wednesday","Thursday","Friday"], time:"Helpline Mon–Fri 09:30–17:00", contactName:"Contact Helpline", contactEmail:"helpline@contact.org.uk", contactPhone:"0808 808 3555", website:"https://contact.org.uk", factChecked:true, ownerId:"seed" },
  { id:"charity-6", category:"charity", name:"KIDS Charity — Disabled Children Support", organisation:"KIDS", type:"Social Skills", location:"Nationwide UK", postcode:"EC1V 0JA", lat:51.5280, lng:-0.0991, description:"National charity providing services for disabled children, young people and families across England. Holiday clubs, short breaks, advice, key worker support and inclusive activities. Offices and services across London, East Midlands, South East, South West and Yorkshire. Website: kids.org.uk", ageMin:0, ageMax:25, accessibility:["Wheelchair accessible","Step-free access","Visual timetables"], support:"1:2 (staff to child)", needs:["Physical disability","Autism","Learning disability","Cerebral palsy","Global development delay","Communication difficulties","ADHD"], cost:"Contact for pricing", funding:["Short Breaks funded","EHCP funded","Charity grants available"], days:["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"], time:"Various — see website", contactName:"KIDS", contactEmail:"enquiries@kids.org.uk", contactPhone:"020 7359 3635", website:"https://www.kids.org.uk", factChecked:true, ownerId:"seed" },
  { id:"charity-7", category:"charity", name:"Surrey Heath Family Centre (Barnardo's)", organisation:"Barnardo's Surrey", type:"Social Skills", location:"Camberley", postcode:"GU15 4AF", lat:51.3361, lng:-0.7436, description:"Barnardo's runs family support services and sensory sessions across Surrey on behalf of Surrey County Council. Also delivers short break programmes and SEND play sessions for families with children of additional needs. Website: barnardosfamilycentressurrey.org.uk", ageMin:0, ageMax:18, accessibility:["Wheelchair accessible","Step-free access","Sensory room"], support:"1:2 (staff to child)", needs:["Autism","Learning disability","Global development delay","Communication difficulties","Sensory processing","Physical disability"], cost:"Free — charity funded", funding:["Fully funded","Short Breaks funded"], days:["Monday","Tuesday","Wednesday","Thursday","Friday"], time:"Various — contact centre", contactName:"Barnardo's Surrey", contactEmail:"surreyheathfamilycentre@barnados.org.uk", contactPhone:"01276 462897", website:"https://www.barnardosfamilycentressurrey.org.uk", factChecked:true, ownerId:"seed" },
  { id:"charity-8", category:"charity", name:"Disability Challengers", organisation:"Disability Challengers", type:"Social Skills", location:"Guildford", postcode:"GU1 1TU", lat:51.2395, lng:-0.5703, description:"Surrey's leading inclusive play and leisure charity for disabled children aged 4–18. Three play centres (Guildford, Farnham, Reigate), youth schemes and holiday clubs. State-of-the-art multi-sensory suites, soft play, art rooms and outdoor spaces. Non-exclusion policy. Website: disability-challengers.org", ageMin:4, ageMax:18, accessibility:["Wheelchair accessible","Changing Places toilet","Sensory room","Step-free access","Visual timetables","Quiet space"], support:"1:1 (staff to child)", needs:["Autism","Physical disability","Learning disability","Cerebral palsy","ADHD","Sensory processing","Global development delay","Communication difficulties"], cost:"£37 per day", funding:["Short Breaks funded","EHCP funded","Charity grants available"], days:["Saturday","Sunday"], time:"10:00 – 16:00 (also half-term and holidays)", contactName:"Disability Challengers", contactEmail:"info@disability-challengers.org", contactPhone:"01483 579390", website:"https://disability-challengers.org", factChecked:true, ownerId:"seed" },
  { id:"charity-9", category:"charity", name:"LinkAble — Learning Disability Charity", organisation:"LinkAble", type:"Social Skills", location:"Woking", postcode:"GU21 5HE", lat:51.3183, lng:-0.5585, description:"Woking-based charity supporting people with learning disabilities and autism throughout their lives. Play sessions, youth groups, adult services, sensory room, soft play and inclusive games events. Committed to empowering people with learning disabilities to live independently. Website: linkable.org.uk", ageMin:0, ageMax:99, accessibility:["Wheelchair accessible","Sensory room","Step-free access","Visual timetables","Quiet space"], support:"1:2 (staff to child)", needs:["Learning disability","Autism","Down's syndrome","Communication difficulties","Global development delay","ADHD"], cost:"Contact for pricing", funding:["Short Breaks funded","EHCP funded","Charity grants available"], days:["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"], time:"Various — see website", contactName:"LinkAble", contactEmail:"info@linkable.org.uk", contactPhone:"01483 770037", website:"https://www.linkable.org.uk", factChecked:true, ownerId:"seed" },
  { id:"charity-10", category:"charity", name:"White Lodge Centre", organisation:"White Lodge Centre", type:"Therapy", location:"Chertsey", postcode:"KT16 0FA", lat:51.3865, lng:-0.5065, description:"Surrey charity providing specialist services for disabled children and adults on a two-acre accessible site in Chertsey. Hydrotherapy pool, physio, OT, speech therapy, holiday clubs and youth activities for children with physical and learning disabilities. Website: whitelodgecentre.co.uk", ageMin:0, ageMax:99, accessibility:["Wheelchair accessible","Hoist available","Hydrotherapy pool","Changing Places toilet","Sensory room","Step-free access"], support:"1:1 (staff to child)", needs:["Cerebral palsy","Physical disability","Learning disability","Global development delay","Communication difficulties","Down's syndrome","Autism"], cost:"Contact for pricing", funding:["EHCP funded","Short Breaks funded","Charity grants available"], days:["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"], time:"Various — see website", contactName:"White Lodge Centre", contactEmail:"info@whitelodgecentre.co.uk", contactPhone:"01932 567131", website:"https://www.whitelodgecentre.co.uk", factChecked:true, ownerId:"seed" },

  {"id": "th-dmi-cpotential", "name": "Dynamic Movement Intervention (DMI)", "organisation": "CPotential", "type": "Therapy", "location": "London", "postcode": "NW6 1RX", "lat": 51.5072, "lng": -0.1276, "description": "Intensive DMI physical therapy for children with motor delay, cerebral palsy, Down's syndrome and global developmental delay, delivered by an integrated team. Initial assessment around £45. Website: cpotential.org.uk", "ageMin": 0, "ageMax": 18, "accessibility": ["Varies by venue"], "support": "Varies by need", "needs": ["Cerebral palsy", "Physical disability", "Global development delay", "Down's syndrome", "Muscular conditions"], "cost": "Assessment ~£45, then per-block", "funding": ["Charity grants available", "Self-pay"], "days": ["Various"], "time": "By appointment", "contactName": "CPotential", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://cpotential.org.uk/our-services/dynamic-movement-intervention/", "factChecked": false, "ownerId": "seed", "category": "therapy"},
  {"id": "th-dmi-kidstherapyworks", "name": "DMI Therapy — Kids' Therapy Works", "organisation": "Kids' Therapy Works", "type": "Therapy", "location": "Colchester", "postcode": "CO6 1DE", "lat": 51.8959, "lng": 0.8919, "description": "Specialist Dynamic Movement Intervention with a qualified DMI physiotherapist at the Copford clinic near Colchester, for children with cerebral palsy and motor delays. Website: kidstherapy.works", "ageMin": 0, "ageMax": 18, "accessibility": ["Varies by venue"], "support": "Varies by need", "needs": ["Cerebral palsy", "Physical disability", "Global development delay", "Down's syndrome", "Muscular conditions"], "cost": "Contact for pricing", "funding": ["Contact provider"], "days": ["Various"], "time": "By appointment", "contactName": "Kids' Therapy Works", "contactEmail": "Contact via website", "contactPhone": "01206 212849", "website": "https://www.kidstherapy.works/dynamic-movement-intervention-dmi", "factChecked": false, "ownerId": "seed", "category": "therapy"},
  {"id": "th-dmi-superkids", "name": "DMI & Paediatric OT — Super Kids Therapy", "organisation": "Super Kids Therapy", "type": "Therapy", "location": "Truro", "postcode": "TR1 1QH", "lat": 50.2632, "lng": -5.051, "description": "One of the few UK centres offering DMI alongside paediatric occupational therapy, MAES therapy, constraint-induced movement therapy and conductive education. Home, school, clinic and online sessions. Website: superkidstherapy.co.uk", "ageMin": 0, "ageMax": 18, "accessibility": ["Varies by venue"], "support": "Varies by need", "needs": ["Cerebral palsy", "Global development delay", "Sensory processing", "Down's syndrome", "Physical disability"], "cost": "Contact for pricing", "funding": ["Self-pay", "Charity grants available"], "days": ["Various"], "time": "By appointment", "contactName": "Super Kids Therapy", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://superkidstherapy.co.uk/", "factChecked": false, "ownerId": "seed", "category": "therapy"},
  {"id": "th-dmi-ribblevalley", "name": "DMI Therapy — Ribble Valley Children's Physiotherapy", "organisation": "Ribble Valley Children's Physiotherapy", "type": "Therapy", "location": "Skipton", "postcode": "BD23 1JX", "lat": 53.9626, "lng": -2.0166, "description": "Specialist paediatric physiotherapy offering DMI to support children with developmental and neurological challenges, improving gross motor skills through neuroplastic movement techniques. Website: ribblevalleychildrensphysio.co.uk", "ageMin": 0, "ageMax": 18, "accessibility": ["Varies by venue"], "support": "Varies by need", "needs": ["Cerebral palsy", "Physical disability", "Global development delay", "Down's syndrome", "Muscular conditions"], "cost": "Contact for pricing", "funding": ["Contact provider"], "days": ["Various"], "time": "By appointment", "contactName": "Ribble Valley Children's Physiotherapy", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://www.ribblevalleychildrensphysio.co.uk/dmi-therapy", "factChecked": false, "ownerId": "seed", "category": "therapy"},
  {"id": "th-dmi-flow", "name": "DMI Therapy — Flow Osteopathy", "organisation": "Flow Osteopathy", "type": "Therapy", "location": "Ilkley", "postcode": "LS29 8DH", "lat": 53.9255, "lng": -1.8226, "description": "DMI therapy and osteopathy for babies and young children working towards gross motor milestones, with clinic and home-visit options in West Yorkshire. Website: flowosteopathy.co.uk", "ageMin": 0, "ageMax": 8, "accessibility": ["Varies by venue"], "support": "Varies by need", "needs": ["Global development delay", "Physical disability", "Cerebral palsy"], "cost": "Contact for pricing", "funding": ["Contact provider"], "days": ["Various"], "time": "By appointment", "contactName": "Flow Osteopathy", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://www.flowosteopathy.co.uk/dmi-therapy", "factChecked": false, "ownerId": "seed", "category": "therapy"},
  {"id": "th-ce-nice", "name": "Conductive Education — NICE", "organisation": "National Institute of Conductive Education", "type": "Therapy", "location": "Birmingham", "postcode": "B13 8RD", "lat": 52.4862, "lng": -1.8904, "description": "The UK's national centre for conductive education, supporting children and adults with cerebral palsy and other motor disorders to build mobility, independence and life skills. Website: conductive-education.org.uk", "ageMin": 0, "ageMax": 99, "accessibility": ["Varies by venue"], "support": "Varies by need", "needs": ["Cerebral palsy", "Physical disability", "Global development delay", "Down's syndrome", "Muscular conditions"], "cost": "Contact for pricing", "funding": ["Contact provider"], "days": ["Various"], "time": "By appointment", "contactName": "National Institute of Conductive Education", "contactEmail": "Contact via website", "contactPhone": "0121 449 1569", "website": "https://www.conductive-education.org.uk", "factChecked": false, "ownerId": "seed", "category": "therapy"},
  {"id": "th-ce-pace", "name": "Conductive Education — The PACE Centre", "organisation": "The PACE Centre", "type": "Therapy", "location": "Aylesbury", "postcode": "HP22 5RQ", "lat": 51.8156, "lng": -0.8084, "description": "Specialist education and conductive-education therapy for children with cerebral palsy and motor disorders, including assessments, family programmes and two non-maintained special schools. Website: thepacecentre.org", "ageMin": 0, "ageMax": 18, "accessibility": ["Varies by venue"], "support": "Varies by need", "needs": ["Cerebral palsy", "Physical disability", "Global development delay", "Down's syndrome", "Muscular conditions"], "cost": "Contact / referral", "funding": ["Contact provider"], "days": ["Various"], "time": "Term time", "contactName": "The PACE Centre", "contactEmail": "Contact via website", "contactPhone": "01296 392739", "website": "https://www.thepacecentre.org", "factChecked": false, "ownerId": "seed", "category": "therapy"},
  {"id": "th-ce-footsteps", "name": "Conductive Education — Footsteps Foundation", "organisation": "Footsteps Foundation", "type": "Therapy", "location": "Thame", "postcode": "OX9 2EP", "lat": 51.747, "lng": -0.977, "description": "Intensive conductive-education and physiotherapy programmes for children with cerebral palsy and motor disorders, using spider-frame and suit therapy near Oxford. Website: footstepsfoundation.org", "ageMin": 1, "ageMax": 18, "accessibility": ["Varies by venue"], "support": "Varies by need", "needs": ["Cerebral palsy", "Physical disability", "Global development delay", "Down's syndrome", "Muscular conditions"], "cost": "Contact for pricing", "funding": ["Contact provider"], "days": ["Various"], "time": "By appointment", "contactName": "Footsteps Foundation", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://www.footstepsfoundation.org", "factChecked": false, "ownerId": "seed", "category": "therapy"},
  {"id": "th-ce-paces", "name": "Conductive Education — Paces Sheffield", "organisation": "Paces", "type": "Therapy", "location": "Sheffield", "postcode": "S35 9ZX", "lat": 53.3811, "lng": -1.4701, "description": "Specialist school and family services delivering conductive education for children with cerebral palsy and motor disorders across South Yorkshire. Website: pacesschool.org", "ageMin": 0, "ageMax": 19, "accessibility": ["Varies by venue"], "support": "Varies by need", "needs": ["Cerebral palsy", "Physical disability", "Global development delay", "Down's syndrome", "Muscular conditions"], "cost": "Contact / referral", "funding": ["Contact provider"], "days": ["Various"], "time": "Term time", "contactName": "Paces", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://www.pacessheffield.org", "factChecked": false, "ownerId": "seed", "category": "therapy"},
  {"id": "th-ce-sticknstep", "name": "Conductive Education — Stick 'n' Step", "organisation": "Stick 'n' Step", "type": "Therapy", "location": "Wallasey", "postcode": "CH44 5UF", "lat": 53.4248, "lng": -3.0739, "description": "Free weekly conductive-education sessions for children and young people with cerebral palsy up to age 25, from centres in Wallasey and Runcorn. Website: sticknstep.org", "ageMin": 0, "ageMax": 25, "accessibility": ["Varies by venue"], "support": "Varies by need", "needs": ["Cerebral palsy", "Physical disability", "Global development delay", "Down's syndrome", "Muscular conditions"], "cost": "Free (charity funded)", "funding": ["Fully funded", "Charity grants available"], "days": ["Various"], "time": "Weekly sessions", "contactName": "Stick 'n' Step", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://www.sticknstep.org", "factChecked": false, "ownerId": "seed", "category": "therapy"},
  {"id": "th-ce-rainbowhouse", "name": "Conductive Education — Rainbow House", "organisation": "Rainbow House (The Rainbow Charity)", "type": "Therapy", "location": "Mawdesley", "postcode": "L40 2QP", "lat": 53.6166, "lng": -2.7637, "description": "Conductive education, therapy and family support for children with cerebral palsy, brain injury and motor disorders in Lancashire. Website: rainbowhouse.org.uk", "ageMin": 0, "ageMax": 19, "accessibility": ["Varies by venue"], "support": "Varies by need", "needs": ["Cerebral palsy", "Physical disability", "Global development delay", "Down's syndrome", "Muscular conditions"], "cost": "Contact for pricing", "funding": ["Contact provider"], "days": ["Various"], "time": "By appointment", "contactName": "Rainbow House (The Rainbow Charity)", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://www.rainbowhouse.org.uk", "factChecked": false, "ownerId": "seed", "category": "therapy"},
  {"id": "th-ce-craighalbert", "name": "Conductive Education — The Craighalbert Centre", "organisation": "Scottish Centre for Children with Motor Impairments", "type": "Therapy", "location": "Cumbernauld", "postcode": "G68 0LS", "lat": 55.945, "lng": -3.9943, "description": "Scotland's national centre for children with cerebral palsy and motor impairments, integrating conductive education, therapy and early-years education. Website: craighalbert.org.uk", "ageMin": 0, "ageMax": 18, "accessibility": ["Varies by venue"], "support": "Varies by need", "needs": ["Cerebral palsy", "Physical disability", "Global development delay", "Down's syndrome", "Muscular conditions"], "cost": "Contact / referral", "funding": ["Contact provider"], "days": ["Various"], "time": "Term time", "contactName": "Scottish Centre for Children with Motor Impairments", "contactEmail": "Contact via website", "contactPhone": "01236 456100", "website": "https://www.craighalbert.org.uk", "factChecked": false, "ownerId": "seed", "category": "therapy"},
  {"id": "th-movementcentre", "name": "Targeted Training — The Movement Centre", "organisation": "The Movement Centre", "type": "Therapy", "location": "Oswestry", "postcode": "SY10 7AG", "lat": 52.8598, "lng": -3.0538, "description": "Provides targeted training therapy to improve posture and movement control for children with movement disorders, based at Oswestry. Website: the-movement-centre.co.uk", "ageMin": 0, "ageMax": 18, "accessibility": ["Varies by venue"], "support": "Varies by need", "needs": ["Cerebral palsy", "Physical disability", "Global development delay", "Down's syndrome", "Muscular conditions"], "cost": "Contact / referral", "funding": ["Contact provider"], "days": ["Various"], "time": "By appointment", "contactName": "The Movement Centre", "contactEmail": "Contact via website", "contactPhone": "01691 404248", "website": "https://www.the-movement-centre.co.uk", "factChecked": false, "ownerId": "seed", "category": "therapy"},
  {"id": "th-brainwave", "name": "Therapy Programmes — Brainwave", "organisation": "Brainwave", "type": "Therapy", "location": "Bridgwater", "postcode": "TA6 4TW", "lat": 51.128, "lng": -2.9962, "description": "Tailored physical, occupational and developmental therapy programmes for children with disabilities and additional needs, with centres in Somerset, Essex and Warrington. Website: brainwave.org.uk", "ageMin": 0, "ageMax": 18, "accessibility": ["Varies by venue"], "support": "Varies by need", "needs": ["Cerebral palsy", "Global development delay", "Autism", "Down's syndrome", "Physical disability"], "cost": "Free / charity funded", "funding": ["Charity grants available"], "days": ["Various"], "time": "By appointment", "contactName": "Brainwave", "contactEmail": "Contact via website", "contactPhone": "01278 429089", "website": "https://www.brainwave.org.uk", "factChecked": false, "ownerId": "seed", "category": "therapy"},
  {"id": "th-bibic", "name": "Developmental Assessments — BIBIC", "organisation": "BIBIC", "type": "Therapy", "location": "Bruton", "postcode": "BA10 0DH", "lat": 51.1126, "lng": -2.453, "description": "Practical assessments and strategies for children with conditions affecting learning, behaviour, communication and sensory processing, supporting families across the UK. Website: bibic.org.uk", "ageMin": 0, "ageMax": 18, "accessibility": ["Varies by venue"], "support": "Varies by need", "needs": ["Autism", "ADHD", "Anxiety", "Communication difficulties", "Sensory processing", "Learning disability"], "cost": "Contact for pricing", "funding": ["Contact provider"], "days": ["Various"], "time": "By appointment", "contactName": "BIBIC", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://www.bibic.org.uk", "factChecked": false, "ownerId": "seed", "category": "therapy"},
  {"id": "th-childrenstrust", "name": "Neurorehabilitation — The Children's Trust", "organisation": "The Children's Trust", "type": "Therapy", "location": "Tadworth", "postcode": "KT20 5RU", "lat": 51.2887, "lng": -0.2393, "description": "The UK's leading charity for children with brain injury, providing residential and community neurorehabilitation, therapy and special education. Website: thechildrenstrust.org.uk", "ageMin": 0, "ageMax": 18, "accessibility": ["Varies by venue"], "support": "Varies by need", "needs": ["Acquired brain injury", "Physical disability", "Communication difficulties", "Global development delay"], "cost": "Contact / referral", "funding": ["Contact provider"], "days": ["Various"], "time": "By appointment", "contactName": "The Children's Trust", "contactEmail": "Contact via website", "contactPhone": "01737 365000", "website": "https://www.thechildrenstrust.org.uk", "factChecked": false, "ownerId": "seed", "category": "therapy"},
  {"id": "th-dvlcc", "name": "Physiotherapy & Conductive Education — DVLCC", "organisation": "Dame Vera Lynn Children's Charity", "type": "Therapy", "location": "Cuckfield", "postcode": "RH17 5JU", "lat": 51.0125, "lng": -0.1486, "description": "Early-years physiotherapy and conductive education for children under five with cerebral palsy and motor learning difficulties in Sussex. Website: dvlcc.org.uk", "ageMin": 0, "ageMax": 5, "accessibility": ["Varies by venue"], "support": "Varies by need", "needs": ["Cerebral palsy", "Physical disability", "Global development delay", "Down's syndrome", "Muscular conditions"], "cost": "Free / charity funded", "funding": ["Charity grants available"], "days": ["Various"], "time": "Term time", "contactName": "Dame Vera Lynn Children's Charity", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://dvlcc.org.uk", "factChecked": false, "ownerId": "seed", "category": "therapy"},
  {"id": "th-bobathcymru", "name": "Cerebral Palsy Therapy — Bobath Cymru", "organisation": "Cerebral Palsy Cymru (Bobath Cymru)", "type": "Therapy", "location": "Cardiff", "postcode": "CF14 5DU", "lat": 51.4816, "lng": -3.1791, "description": "Specialist Bobath therapy for babies and children with cerebral palsy across Wales, with physiotherapy, occupational therapy and speech & language therapy. Website: bobathwales.org", "ageMin": 0, "ageMax": 18, "accessibility": ["Varies by venue"], "support": "Varies by need", "needs": ["Cerebral palsy", "Physical disability", "Global development delay", "Down's syndrome", "Muscular conditions"], "cost": "Free / charity funded", "funding": ["Charity grants available"], "days": ["Various"], "time": "By appointment", "contactName": "Cerebral Palsy Cymru (Bobath Cymru)", "contactEmail": "Contact via website", "contactPhone": "029 2052 2600", "website": "https://www.bobathwales.org", "factChecked": false, "ownerId": "seed", "category": "therapy"},
  {"id": "th-bobathscot", "name": "Cerebral Palsy Therapy — Bobath Scotland", "organisation": "Bobath Scotland", "type": "Therapy", "location": "Glasgow", "postcode": "G51 4EB", "lat": 55.8642, "lng": -4.2518, "description": "Scotland's centre for children and adults with cerebral palsy, delivering specialist Bobath therapy and family support. Website: bobathscotland.org.uk", "ageMin": 0, "ageMax": 99, "accessibility": ["Varies by venue"], "support": "Varies by need", "needs": ["Cerebral palsy", "Physical disability", "Global development delay", "Down's syndrome", "Muscular conditions"], "cost": "Free / charity funded", "funding": ["Charity grants available"], "days": ["Various"], "time": "By appointment", "contactName": "Bobath Scotland", "contactEmail": "Contact via website", "contactPhone": "0141 352 5000", "website": "https://www.bobathscotland.org.uk", "factChecked": false, "ownerId": "seed", "category": "therapy"},
  {"id": "th-si-siuk", "name": "Sensory Integration Therapy Finder", "organisation": "Sensory Integration Education (SIE)", "type": "Sensory", "location": "Nationwide UK", "postcode": "", "lat": 52.5, "lng": -1.5, "description": "Directory of qualified sensory-integration therapists for children with autism, ADHD, DCD and sensory processing differences across the UK. Website: sensoryintegration.org.uk", "ageMin": 0, "ageMax": 18, "accessibility": ["Varies by venue"], "support": "Varies by need", "needs": ["Autism", "ADHD", "Anxiety", "Communication difficulties", "Sensory processing"], "cost": "Contact individual therapist", "funding": ["Contact provider"], "days": ["Various"], "time": "By appointment", "contactName": "Sensory Integration Education (SIE)", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://www.sensoryintegration.org.uk", "factChecked": false, "ownerId": "seed", "category": "therapy"},
  {"id": "th-otforkids", "name": "Paediatric Occupational Therapy — OT for Kids", "organisation": "OT for Kids", "type": "Therapy", "location": "Nationwide UK", "postcode": "", "lat": 52.5, "lng": -1.5, "description": "Independent paediatric occupational therapists offering assessments and therapy for handwriting, coordination, sensory processing and daily-living skills, with clinics across England. Website: otforkids.co.uk", "ageMin": 0, "ageMax": 18, "accessibility": ["Varies by venue"], "support": "Varies by need", "needs": ["Sensory processing", "Autism", "ADHD", "Physical disability", "Global development delay"], "cost": "Contact for pricing", "funding": ["Contact provider"], "days": ["Various"], "time": "By appointment", "contactName": "OT for Kids", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://www.otforkids.co.uk", "factChecked": false, "ownerId": "seed", "category": "therapy"},
  {"id": "th-asltip", "name": "Independent Speech & Language Therapy", "organisation": "ASLTIP", "type": "Therapy", "location": "Nationwide UK", "postcode": "", "lat": 52.5, "lng": -1.5, "description": "Find an independent speech and language therapist for children with communication difficulties, autism, DLD and feeding difficulties through the ASLTIP directory. Website: asltip.com", "ageMin": 0, "ageMax": 18, "accessibility": ["Varies by venue"], "support": "Varies by need", "needs": ["Communication difficulties", "Autism", "Hearing impairment", "Global development delay"], "cost": "Contact individual therapist", "funding": ["Contact provider"], "days": ["Various"], "time": "By appointment", "contactName": "ASLTIP", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://www.asltip.com", "factChecked": false, "ownerId": "seed", "category": "therapy"},
  {"id": "th-nordoff", "name": "Music Therapy — Nordoff and Robbins", "organisation": "Nordoff and Robbins", "type": "Music", "location": "London", "postcode": "NW5 3BJ", "lat": 51.5072, "lng": -0.1276, "description": "The UK's largest music therapy charity, providing one-to-one and group music therapy for children with autism, learning disabilities and complex needs. Website: nordoff-robbins.org.uk", "ageMin": 0, "ageMax": 25, "accessibility": ["Varies by venue"], "support": "Varies by need", "needs": ["Learning disability", "Autism", "Down's syndrome", "Communication difficulties", "Global development delay", "Anxiety"], "cost": "Contact — bursaries available", "funding": ["Bursary available", "Charity grants available"], "days": ["Various"], "time": "By appointment", "contactName": "Nordoff and Robbins", "contactEmail": "Contact via website", "contactPhone": "020 7267 4496", "website": "https://www.nordoff-robbins.org.uk", "factChecked": false, "ownerId": "seed", "category": "therapy"},
  {"id": "th-chiltern-music", "name": "Music Therapy — Chiltern Music Therapy", "organisation": "Chiltern Music Therapy", "type": "Music", "location": "Nationwide UK", "postcode": "", "lat": 52.5, "lng": -1.5, "description": "Music therapy services for children with disabilities, autism and complex needs in clinics, schools and homes across central and southern England. Website: chilternmusictherapy.co.uk", "ageMin": 0, "ageMax": 18, "accessibility": ["Varies by venue"], "support": "Varies by need", "needs": ["Learning disability", "Autism", "Down's syndrome", "Communication difficulties", "Global development delay", "Sensory processing"], "cost": "Contact for pricing", "funding": ["Contact provider"], "days": ["Various"], "time": "By appointment", "contactName": "Chiltern Music Therapy", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://www.chilternmusictherapy.co.uk", "factChecked": false, "ownerId": "seed", "category": "therapy"},
  {"id": "th-ohmi", "name": "One-Handed Music Making — OHMI Trust", "organisation": "The OHMI Trust", "type": "Music", "location": "Birmingham", "postcode": "B15 2TT", "lat": 52.4862, "lng": -1.8904, "description": "Enables children with physical disabilities to learn and play music using adapted one-handed instruments, with a hire scheme and teaching programme. Website: ohmi.org.uk", "ageMin": 4, "ageMax": 18, "accessibility": ["Varies by venue"], "support": "Varies by need", "needs": ["Physical disability", "Cerebral palsy", "Upper-limb difference"], "cost": "Contact for pricing", "funding": ["Contact provider"], "days": ["Various"], "time": "By appointment", "contactName": "The OHMI Trust", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://www.ohmi.org.uk", "factChecked": false, "ownerId": "seed", "category": "therapy"},
  {"id": "th-baat", "name": "Art Therapy Finder — BAAT", "organisation": "British Association of Art Therapists", "type": "Therapy", "location": "Nationwide UK", "postcode": "", "lat": 52.5, "lng": -1.5, "description": "Find HCPC-registered art therapists working with children with SEND, trauma and mental-health challenges through the BAAT directory. Website: baat.org", "ageMin": 3, "ageMax": 25, "accessibility": ["Varies by venue"], "support": "Varies by need", "needs": ["Autism", "ADHD", "Anxiety", "Communication difficulties", "Sensory processing", "Learning disability"], "cost": "Contact individual therapist", "funding": ["Contact provider"], "days": ["Various"], "time": "By appointment", "contactName": "British Association of Art Therapists", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://www.baat.org", "factChecked": false, "ownerId": "seed", "category": "therapy"},
  {"id": "th-badth", "name": "Drama Therapy Finder — BADth", "organisation": "British Association of Dramatherapists", "type": "Drama", "location": "Nationwide UK", "postcode": "", "lat": 52.5, "lng": -1.5, "description": "Find registered dramatherapists supporting children with autism, communication difficulties and emotional needs through creative, embodied therapy. Website: badth.org.uk", "ageMin": 4, "ageMax": 25, "accessibility": ["Varies by venue"], "support": "Varies by need", "needs": ["Autism", "ADHD", "Anxiety", "Communication difficulties", "Sensory processing", "Learning disability"], "cost": "Contact individual therapist", "funding": ["Contact provider"], "days": ["Various"], "time": "By appointment", "contactName": "British Association of Dramatherapists", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://www.badth.org.uk", "factChecked": false, "ownerId": "seed", "category": "therapy"},
  {"id": "th-ptuk", "name": "Play Therapy — PTUK Register", "organisation": "Play Therapy UK", "type": "Therapy", "location": "Nationwide UK", "postcode": "", "lat": 52.5, "lng": -1.5, "description": "Register of accredited play and creative-arts therapists helping children with emotional, behavioural and developmental difficulties across the UK. Website: playtherapy.org.uk", "ageMin": 3, "ageMax": 16, "accessibility": ["Varies by venue"], "support": "Varies by need", "needs": ["Autism", "ADHD", "Anxiety", "Communication difficulties", "Sensory processing", "Anxiety"], "cost": "Contact individual therapist", "funding": ["Contact provider"], "days": ["Various"], "time": "By appointment", "contactName": "Play Therapy UK", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://playtherapy.org.uk", "factChecked": false, "ownerId": "seed", "category": "therapy"},
  {"id": "th-acecentre", "name": "Communication Aids (AAC) — Ace Centre", "organisation": "Ace Centre", "type": "Technology", "location": "Oxford", "postcode": "OX4 6LB", "lat": 51.752, "lng": -1.2577, "description": "Specialist assessment and support for augmentative and alternative communication and assistive technology for children who are non-verbal or have complex communication needs. Website: acecentre.org.uk", "ageMin": 0, "ageMax": 25, "accessibility": ["Varies by venue"], "support": "Varies by need", "needs": ["Communication difficulties", "Cerebral palsy", "Physical disability", "Autism"], "cost": "Free / NHS-commissioned", "funding": ["NHS referral", "Fully funded"], "days": ["Various"], "time": "By appointment", "contactName": "Ace Centre", "contactEmail": "Contact via website", "contactPhone": "0800 080 3115", "website": "https://acecentre.org.uk", "factChecked": false, "ownerId": "seed", "category": "therapy"},
  {"id": "th-rebound", "name": "Rebound Therapy (Trampoline)", "organisation": "ReboundTherapy.org", "type": "Sports", "location": "Nationwide UK", "postcode": "", "lat": 52.5, "lng": -1.5, "description": "The official UK body for rebound therapy — the use of trampolines for therapeutic exercise and recreation for people with disabilities and additional needs. Find accredited providers. Website: reboundtherapy.org", "ageMin": 3, "ageMax": 99, "accessibility": ["Varies by venue"], "support": "Varies by need", "needs": ["Physical disability", "Autism", "Learning disability", "Sensory processing", "Cerebral palsy"], "cost": "Contact provider", "funding": ["Contact provider"], "days": ["Various"], "time": "Contact provider", "contactName": "ReboundTherapy.org", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://www.reboundtherapy.org", "factChecked": false, "ownerId": "seed", "category": "therapy"},
  {"id": "th-halliwick", "name": "Halliwick Swimming Therapy", "organisation": "Halliwick Association of Swimming Therapy", "type": "Swimming", "location": "Nationwide UK", "postcode": "", "lat": 52.5, "lng": -1.5, "description": "Promotes the Halliwick Concept for teaching disabled people to swim and move independently in water, with member clubs across the UK. Website: halliwick.org.uk", "ageMin": 3, "ageMax": 99, "accessibility": ["Varies by venue"], "support": "Varies by need", "needs": ["Physical disability", "Cerebral palsy", "Learning disability", "Autism"], "cost": "Contact local club", "funding": ["Contact provider"], "days": ["Various"], "time": "Contact local club", "contactName": "Halliwick Association of Swimming Therapy", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://halliwick.org.uk", "factChecked": false, "ownerId": "seed", "category": "therapy"},
  {"id": "th-specialyoga", "name": "Special Yoga for SEND", "organisation": "Special Yoga", "type": "Therapy", "location": "London", "postcode": "NW10 2XD", "lat": 51.5072, "lng": -0.1276, "description": "Therapeutic yoga for children with autism, ADHD, cerebral palsy and complex needs, plus parent and professional training. Website: specialyoga.org.uk", "ageMin": 2, "ageMax": 18, "accessibility": ["Varies by venue"], "support": "Varies by need", "needs": ["Autism", "ADHD", "Anxiety", "Communication difficulties", "Sensory processing", "Cerebral palsy"], "cost": "Contact for pricing", "funding": ["Contact provider"], "days": ["Various"], "time": "By appointment", "contactName": "Special Yoga", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://www.specialyoga.org.uk", "factChecked": false, "ownerId": "seed", "category": "therapy"},
  {"id": "th-soundabout", "name": "Multi-Sensory Music — Soundabout", "organisation": "Soundabout", "type": "Music", "location": "Oxford", "postcode": "OX29 8LH", "lat": 51.752, "lng": -1.2577, "description": "Uses music and sound to unlock communication for children and young people with severe and profound learning disabilities. Website: soundabout.org.uk", "ageMin": 0, "ageMax": 25, "accessibility": ["Varies by venue"], "support": "Varies by need", "needs": ["Learning disability", "Profound and multiple learning disability", "Communication difficulties", "Sensory processing"], "cost": "Free / charity funded", "funding": ["Charity grants available"], "days": ["Various"], "time": "Various", "contactName": "Soundabout", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://soundabout.org.uk", "factChecked": false, "ownerId": "seed", "category": "therapy"},
  {"id": "th-bagbooks", "name": "Multi-Sensory Storytelling — Bag Books", "organisation": "Bag Books", "type": "Sensory", "location": "London", "postcode": "SW9 6DE", "lat": 51.5072, "lng": -0.1276, "description": "Multi-sensory stories and storytelling sessions for children and adults with severe and profound learning disabilities. Website: bagbooks.org", "ageMin": 0, "ageMax": 99, "accessibility": ["Varies by venue"], "support": "Varies by need", "needs": ["Profound and multiple learning disability", "Learning disability", "Sensory processing", "Communication difficulties"], "cost": "Contact for pricing", "funding": ["Contact provider"], "days": ["Various"], "time": "Various", "contactName": "Bag Books", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://bagbooks.org", "factChecked": false, "ownerId": "seed", "category": "therapy"},
  {"id": "th-osteo-children", "name": "Paediatric Cranial Osteopathy", "organisation": "Foundation for Paediatric Osteopathy", "type": "Therapy", "location": "London", "postcode": "SW9 8BB", "lat": 51.5072, "lng": -0.1276, "description": "Gentle osteopathic treatment for babies and children, including those with disabilities and complex needs, at a not-for-profit clinic with a sliding-scale fee. Website: fpo.org.uk", "ageMin": 0, "ageMax": 18, "accessibility": ["Varies by venue"], "support": "Varies by need", "needs": ["Global development delay", "Cerebral palsy", "Physical disability"], "cost": "Sliding-scale fee", "funding": ["Contact provider"], "days": ["Various"], "time": "By appointment", "contactName": "Foundation for Paediatric Osteopathy", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://www.fpo.org.uk", "factChecked": false, "ownerId": "seed", "category": "therapy"},
  {"id": "th-theraplay", "name": "Theraplay & Attachment", "organisation": "The Theraplay Institute (UK practitioners)", "type": "Therapy", "location": "Nationwide UK", "postcode": "", "lat": 52.5, "lng": -1.5, "description": "Play-based, attachment-focused therapy supporting children with developmental, emotional and attachment needs, delivered by certified UK practitioners. Website: theraplay.org", "ageMin": 0, "ageMax": 16, "accessibility": ["Varies by venue"], "support": "Varies by need", "needs": ["Anxiety", "Attachment difficulties", "Autism", "Communication difficulties"], "cost": "Contact individual therapist", "funding": ["Contact provider"], "days": ["Various"], "time": "By appointment", "contactName": "The Theraplay Institute (UK practitioners)", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://theraplay.org", "factChecked": false, "ownerId": "seed", "category": "therapy"},
  {"id": "th-appi", "name": "Paediatric Pilates (APPI)", "organisation": "APPI — Australian Physiotherapy & Pilates Institute", "type": "Therapy", "location": "Nationwide UK", "postcode": "", "lat": 52.5, "lng": -1.5, "description": "Physiotherapist-led paediatric Pilates to build core strength, posture and motor control for children with hypermobility, DCD and physical needs. Find APPI-trained physios. Website: appihealthgroup.com", "ageMin": 4, "ageMax": 18, "accessibility": ["Varies by venue"], "support": "Varies by need", "needs": ["Physical disability", "Global development delay", "Hypermobility", "Cerebral palsy"], "cost": "Contact for pricing", "funding": ["Contact provider"], "days": ["Various"], "time": "By appointment", "contactName": "APPI — Australian Physiotherapy & Pilates Institute", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://www.appihealthgroup.com", "factChecked": false, "ownerId": "seed", "category": "therapy"},
  {"id": "th-musicman", "name": "The Music Man Project", "organisation": "The Music Man Project", "type": "Music", "location": "Nationwide UK", "postcode": "", "lat": 52.5, "lng": -1.5, "description": "Music education and performance for children and adults with learning disabilities, with regional groups and landmark performances. Website: themusicmanproject.com", "ageMin": 5, "ageMax": 99, "accessibility": ["Varies by venue"], "support": "Varies by need", "needs": ["Learning disability", "Down's syndrome", "Autism", "Communication difficulties"], "cost": "Contact local group", "funding": ["Contact provider"], "days": ["Various"], "time": "Weekly sessions", "contactName": "The Music Man Project", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://themusicmanproject.com", "factChecked": false, "ownerId": "seed", "category": "therapy"},
  {"id": "th-drakemusic", "name": "Accessible Music Technology — Drake Music", "organisation": "Drake Music", "type": "Technology", "location": "Nationwide UK", "postcode": "", "lat": 52.5, "lng": -1.5, "description": "Pioneers accessible music technology and inclusive music-making for disabled children and young people. Website: drakemusic.org", "ageMin": 5, "ageMax": 25, "accessibility": ["Varies by venue"], "support": "Varies by need", "needs": ["Physical disability", "Learning disability", "Autism", "Communication difficulties"], "cost": "Contact for details", "funding": ["Contact provider"], "days": ["Various"], "time": "Various", "contactName": "Drake Music", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://www.drakemusic.org", "factChecked": false, "ownerId": "seed", "category": "therapy"},
  {"id": "th-hydro-whitelodge2", "name": "Hydrotherapy — Children's Programmes", "organisation": "Aquatic Therapy Association of Chartered Physiotherapists", "type": "Swimming", "location": "Nationwide UK", "postcode": "", "lat": 52.5, "lng": -1.5, "description": "Find chartered physiotherapists providing hydrotherapy (aquatic physiotherapy) for children with neurological and physical conditions in warm-water pools. Website: atacp.csp.org.uk", "ageMin": 0, "ageMax": 18, "accessibility": ["Varies by venue"], "support": "Varies by need", "needs": ["Cerebral palsy", "Physical disability", "Global development delay", "Down's syndrome", "Muscular conditions"], "cost": "Contact / NHS referral", "funding": ["NHS referral"], "days": ["Various"], "time": "By appointment", "contactName": "Aquatic Therapy Association of Chartered Physiotherapists", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://atacp.csp.org.uk", "factChecked": false, "ownerId": "seed", "category": "therapy"},
  {"id": "ch-sense", "name": "Sense — Complex Disabilities", "organisation": "Sense", "type": "Social Skills", "location": "Nationwide UK", "postcode": "N4 3SR", "lat": 52.5, "lng": -1.5, "description": "National charity for children and adults who are deafblind or have complex disabilities, providing family support, activities, holidays and specialist services. Website: sense.org.uk", "ageMin": 0, "ageMax": 99, "accessibility": ["Varies by venue"], "support": "Varies by need", "needs": ["Deafblind", "Sensory impairment", "Learning disability", "Physical disability", "Communication difficulties"], "cost": "Free — charity services", "funding": ["Fully funded", "Charity grants available"], "days": ["Various"], "time": "Mon–Fri", "contactName": "Sense", "contactEmail": "Contact via website", "contactPhone": "0300 330 9256", "website": "https://www.sense.org.uk", "factChecked": false, "ownerId": "seed", "category": "charity"},
  {"id": "ch-cerebra", "name": "Cerebra — Brain Conditions", "organisation": "Cerebra", "type": "Social Skills", "location": "Nationwide UK", "postcode": "SA31 1EQ", "lat": 52.5, "lng": -1.5, "description": "Helps children with brain conditions and their families through a sleep service, parent guides, a bespoke equipment-design centre and an innovation library. Website: cerebra.org.uk", "ageMin": 0, "ageMax": 16, "accessibility": ["Varies by venue"], "support": "Varies by need", "needs": ["Cerebral palsy", "Autism", "Learning disability", "Global development delay", "Complex health needs"], "cost": "Free — charity services", "funding": ["Fully funded", "Charity grants available"], "days": ["Various"], "time": "Mon–Fri", "contactName": "Cerebra", "contactEmail": "Contact via website", "contactPhone": "0800 328 1159", "website": "https://cerebra.org.uk", "factChecked": false, "ownerId": "seed", "category": "charity"},
  {"id": "ch-familyfund", "name": "Family Fund — Grants", "organisation": "Family Fund", "type": "Social Skills", "location": "Nationwide UK", "postcode": "YO30 4WT", "lat": 52.5, "lng": -1.5, "description": "The UK's largest grant-giver to families raising disabled or seriously ill children on low incomes — grants for essentials like washing machines, beds, sensory toys and family breaks. Website: familyfund.org.uk", "ageMin": 0, "ageMax": 17, "accessibility": ["Varies by venue"], "support": "Varies by need", "needs": ["All disabilities and conditions"], "cost": "Free — grants for eligible families", "funding": ["Charity grants available"], "days": ["Various"], "time": "Mon–Fri", "contactName": "Family Fund", "contactEmail": "Contact via website", "contactPhone": "01904 550055", "website": "https://www.familyfund.org.uk", "factChecked": false, "ownerId": "seed", "category": "charity"},
  {"id": "ch-newlife", "name": "Newlife — Equipment & Emergency Loans", "organisation": "Newlife the Charity for Disabled Children", "type": "Social Skills", "location": "Nationwide UK", "postcode": "WS11 7GF", "lat": 52.5, "lng": -1.5, "description": "Provides specialist equipment grants, emergency equipment loans and a nurse helpline for disabled and terminally ill children across the UK. Website: newlifecharity.co.uk", "ageMin": 0, "ageMax": 18, "accessibility": ["Varies by venue"], "support": "Varies by need", "needs": ["Physical disability", "Complex health needs", "Cerebral palsy", "Global development delay"], "cost": "Free — grants & loans", "funding": ["Charity grants available"], "days": ["Various"], "time": "Mon–Fri", "contactName": "Newlife the Charity for Disabled Children", "contactEmail": "Contact via website", "contactPhone": "0800 902 0095", "website": "https://newlifecharity.co.uk", "factChecked": false, "ownerId": "seed", "category": "charity"},
  {"id": "ch-whizzkidz", "name": "Whizz Kidz — Wheelchairs & Mobility", "organisation": "Whizz Kidz", "type": "Social Skills", "location": "Nationwide UK", "postcode": "SE1 0NX", "lat": 52.5, "lng": -1.5, "description": "Transforms the lives of young wheelchair users with mobility equipment, wheelchair-skills training, youth clubs and employment programmes. Website: whizz-kidz.org.uk", "ageMin": 0, "ageMax": 25, "accessibility": ["Varies by venue"], "support": "Varies by need", "needs": ["Physical disability", "Cerebral palsy", "Muscular conditions", "Spina bifida"], "cost": "Free — charity services", "funding": ["Charity grants available"], "days": ["Various"], "time": "Mon–Fri", "contactName": "Whizz Kidz", "contactEmail": "Contact via website", "contactPhone": "020 7233 6600", "website": "https://www.whizz-kidz.org.uk", "factChecked": false, "ownerId": "seed", "category": "charity"},
  {"id": "ch-whizzkidz-skills", "name": "Whizz-Kidz Wheelchair Skills Training", "organisation": "Whizz Kidz", "type": "Sports", "location": "Nationwide UK", "postcode": "SE1 0NX", "lat": 52.5, "lng": -1.5, "description": "Accredited wheelchair skills training for manual and powered wheelchair users aged 2-25, delivered in schools, community settings, or directly through Whizz Kidz. Beginner, intermediate and advanced modules, plus Travel Training and Train-the-Trainer courses for parents and professionals. Free of charge. Website: whizz-kidz.org.uk", "ageMin": 2, "ageMax": 25, "accessibility": ["Varies by venue"], "needs": ["Physical disability", "Cerebral palsy", "Muscular conditions", "Spina bifida"], "cost": "Free", "funding": ["Fully funded"], "days": ["Various"], "time": "By arrangement — contact to book", "contactName": "Whizz Kidz", "contactEmail": "kidzservices@whizz-kidz.org.uk", "contactPhone": "0800 151 3350", "website": "https://www.whizz-kidz.org.uk/skills-and-training/wheelchair-skills-training/", "factChecked": false, "ownerId": "seed", "category": "activity"},
  {"id": "ch-whizzkidz-activity-redhill", "name": "Whizz-Kidz Activity Programme — Redhill", "organisation": "Whizz Kidz", "type": "Social Skills", "location": "Redhill", "postcode": "RH1", "lat": 51.2367, "lng": -0.1738, "description": "Free monthly activity programme for young wheelchair users aged 8-25 — club sessions and family days supporting independence, wellbeing and social connection. One of only three Whizz Kidz activity programme locations in England (alongside Maidstone and London). Contact Whizz Kidz directly to confirm the current venue and session dates. Website: whizz-kidz.org.uk", "ageMin": 8, "ageMax": 25, "accessibility": ["Varies by venue"], "needs": ["Physical disability", "Cerebral palsy", "Muscular conditions", "Spina bifida"], "cost": "Free", "funding": ["Fully funded"], "days": ["Various"], "time": "Monthly — contact for current schedule", "contactName": "Whizz Kidz", "contactEmail": "kidzservices@whizz-kidz.org.uk", "contactPhone": "0800 151 3350", "website": "https://www.whizz-kidz.org.uk/social-activities/activity-programmes/", "factChecked": false, "ownerId": "seed", "category": "activity"},
  {"id": "ch-whizzkidz-online", "name": "Whizz-Kidz Online Activities", "organisation": "Whizz Kidz", "type": "Social Skills", "location": "Nationwide UK (online)", "postcode": "SE1 0NX", "lat": 52.5, "lng": -1.5, "description": "Free virtual activity sessions for young wheelchair users aged 8-25, held twice a month at weekends — virtual safaris, digital skills, creative arts, cooking and science experiments. A way to connect with other young wheelchair users from home if in-person clubs aren't accessible. Website: whizz-kidz.org.uk", "ageMin": 8, "ageMax": 25, "accessibility": ["Online — no physical access requirements"], "needs": ["Physical disability", "Cerebral palsy", "Muscular conditions", "Spina bifida"], "cost": "Free", "funding": ["Fully funded"], "days": ["Saturday", "Sunday"], "time": "Twice monthly — contact for current schedule", "contactName": "Whizz Kidz", "contactEmail": "kidzservices@whizz-kidz.org.uk", "contactPhone": "0800 151 3350", "website": "https://www.whizz-kidz.org.uk/social-activities/activity-days/", "factChecked": false, "ownerId": "seed", "category": "activity"},
  {"id": "south-highfive-ot", "name": "High Five Children's OT", "organisation": "High Five Children's OT", "type": "Therapy", "location": "Guildford", "postcode": "GU1 3UA", "lat": 51.2362, "lng": -0.5704, "description": "Private paediatric occupational therapy clinic for children aged 0-18, covering Guildford, Farnham, Woking, Weybridge, Dorking, Camberley, Leatherhead, Hampshire and SW London. Specialises in handwriting, sensory processing, and dyspraxia/motor coordination assessment and intervention. Supports children with Dyspraxia/DCD, ASD, ADHD, developmental delay, and those with or awaiting an EHCP. Seen at clinic, home, or school. Website: highfivechildrenot.co.uk", "ageMin": 0, "ageMax": 18, "accessibility": ["Clinic, home or school visits"], "needs": ["Dyspraxia/DCD", "Autism", "ADHD", "Developmental delay", "Handwriting difficulties", "Sensory processing"], "cost": "Private — contact for fees", "funding": ["Self-pay", "EHCP-related provision"], "days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], "time": "By appointment", "contactName": "Sherry Aazh", "contactEmail": "Sherry.aazh@highfivechildrenot.co.uk", "contactPhone": "07954 322101", "website": "https://highfivechildrenot.co.uk", "notifyOnPublish": true, "factChecked": true, "ownerId": "seed", "category": "therapy"},
  {"id": "south-sensoftplay", "name": "Sensory Soft Play (Sensoft)", "organisation": "Sensory Soft Play", "type": "Sensory", "location": "Hastings", "postcode": "TN34", "lat": 50.8543, "lng": 0.5735, "description": "Sussex-based SEND charity (Charity No. 1183273) supporting children and young people with special educational needs in Hastings and surrounding areas. Saturday respite clubs, holiday clubs, after-school clubs, funded trips, plus multi-sensory experiences, arts and crafts, forest school and soft play. Sensory room and soft play area available to hire (up to 4 adults + 4 children, £12/hour). Sessions are popular — email to enquire first. Confirm exact venue and times directly. Website: sensoftplay.co.uk", "ageMin": 0, "ageMax": 18, "accessibility": ["Sensory room", "Soft play"], "needs": ["Autism", "Learning disability", "Sensory processing", "Complex needs"], "cost": "Sensory room hire £12/hour; session prices vary", "funding": ["Charity grants available", "Local authority funded"], "days": ["Monday", "Wednesday", "Friday", "Saturday"], "time": "Saturday respite AM/PM; after-school Mon & Wed; see website for current schedule", "contactName": "Lisa Henderson", "contactEmail": "info@sensoftplay.co.uk", "contactPhone": "", "website": "https://www.sensoftplay.co.uk", "notifyOnPublish": true, "factChecked": true, "ownerId": "seed", "category": "charity"},
  {"id": "south-pavilion-sensory4all", "name": "Sensory4All — Pavilion on the Park", "organisation": "Eastleigh Youth and Community Trust", "type": "Sensory", "location": "Eastleigh", "postcode": "SO50 9LH", "lat": 50.9690, "lng": -1.3500, "description": "Multi-sensory suite at the Pavilion on the Park in Eastleigh (registered charity 1154430), for people of all ages and abilities. Private sessions (up to 15 people, 55 mins, £25 weekday / £35 weekend), a sensory playgroup for ages 0-5 (Fridays, £5/child), 'Hide & Seekers' SEN/D play sessions for ages 4-11 (selected Saturdays, £3/child), and bespoke sensory birthday parties. Full bubble tube, interactive media, infinity mirror and projector features. Particularly popular with families of children with autism, sensory impairments and learning difficulties. Website: paviliononthepark.org", "ageMin": 0, "ageMax": 18, "accessibility": ["Wheelchair accessible", "Sensory room", "Café on site"], "needs": ["Autism", "Sensory impairments", "Learning difficulties", "Complex needs"], "cost": "From £3 (Hide & Seekers); private sessions £25-£35", "funding": ["Self-pay"], "days": ["Monday", "Wednesday", "Thursday", "Friday", "Saturday"], "time": "Varies by session — see website calendar", "contactName": "Pavilion on the Park", "contactEmail": "", "contactPhone": "023 8061 2710", "website": "https://paviliononthepark.org/our-projects/sensory4all/", "notifyOnPublish": true, "factChecked": true, "ownerId": "seed", "category": "activity"},
  {"id": "south-dolphins-swim", "name": "Dolphins Swim Club (Swimobility)", "organisation": "Surrey Dolphins Swimobility", "type": "Swimming", "location": "Woking & Guildford", "postcode": "GU22 9BA", "lat": 51.3050, "lng": -0.5530, "description": "Friendly, term-time swimming sessions open to anyone whose physical or mental health would benefit, including children and adults with additional needs and disabilities. No referral needed; friends, family and carers welcome to join in the water. Water kept at a comfortable temperature and all abilities supported, with in-water volunteers including a physiotherapist. Sessions at Woking Pool in the Park (Fridays 7:30-8:30pm, with wave machine) and Surrey Sports Park, Guildford (Fridays 11:45am-12:45pm). Confirm current times directly. Source: Surrey County Council.", "ageMin": 0, "ageMax": 18, "accessibility": ["Accessible pool", "In-water support volunteers"], "needs": ["Physical disability", "Learning disability", "Additional needs", "Mental health"], "cost": "Contact for session fees", "funding": ["Self-pay"], "days": ["Tuesday", "Friday"], "time": "Term-time — see club for current schedule", "contactName": "Surrey Dolphins Swimobility", "contactEmail": "", "contactPhone": "", "website": "https://www.surreycc.gov.uk/children/support-and-advice/families/directory/s/sen-dolphin-swim-club-woking", "notifyOnPublish": true, "factChecked": true, "ownerId": "seed", "category": "activity"},
  {"id": "south-cranleigh-rda", "name": "Cranleigh RDA (Riding for the Disabled)", "organisation": "Cranleigh RDA Group", "type": "Riding", "location": "Cranleigh", "postcode": "GU6", "lat": 51.1390, "lng": -0.4850, "description": "Riding for the Disabled group (registered charity 1125242) offering therapeutic horse riding to children and adults with special needs around Cranleigh, Guildford and into West Sussex. Riding and contact with horses and volunteers helps develop self-esteem, confidence and independence. Over 200 riders take part and the group is run by 190+ volunteers. A voluntary organisation reliant entirely on donations and fundraising — no state funding. Contact directly to confirm current session availability and waiting lists.", "ageMin": 0, "ageMax": 18, "accessibility": ["Therapeutic riding", "Trained volunteers"], "needs": ["Physical disability", "Learning disability", "Special educational needs"], "cost": "Contact for fees", "funding": ["Charity-funded"], "days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], "time": "Contact for current riding sessions", "contactName": "Cranleigh RDA Group", "contactEmail": "", "contactPhone": "", "website": "http://www.cranleighrdagroup.co.uk", "notifyOnPublish": true, "factChecked": true, "ownerId": "seed", "category": "activity"},
  {"id": "south-frensham-sailability", "name": "Frensham Pond Sailability", "organisation": "Frensham Pond Sailing Club", "type": "Sailing", "location": "Churt, Farnham", "postcode": "GU10 2QA", "lat": 51.1530, "lng": -0.8030, "description": "Sailability programme at Frensham Pond Sailing Club, offering first-class facilities for people of all ages with disabilities or long-term illness who need support to sail, set on Frensham Great Pond near Farnham. Quality sailing, racing, training and safety programmes with adapted Hansa boats. RYA registered training centre. Sailor membership available; contact the Sailability team to arrange a taster or discuss support needs.", "ageMin": 0, "ageMax": 18, "accessibility": ["Adapted boats", "Trained support volunteers", "Accessible facilities"], "needs": ["Physical disability", "Learning disability", "Long-term illness", "Special educational needs"], "cost": "Membership required — contact for details", "funding": ["Self-pay", "Charity-supported"], "days": ["Saturday", "Sunday", "Wednesday"], "time": "Contact Sailability team for session days", "contactName": "Frensham Pond Sailability", "contactEmail": "", "contactPhone": "01252 792859", "website": "https://www.sailfrensham.org.uk/sailability-info", "notifyOnPublish": true, "factChecked": true, "ownerId": "seed", "category": "activity"},
  {"id": "south-me2club", "name": "Me2 Club", "organisation": "Me2 Club", "type": "Social Skills", "location": "Wokingham & Reading", "postcode": "RG41 2GY", "lat": 51.4120, "lng": -0.8330, "description": "Inclusion charity (established 2003) for children and young people aged 5-19 with additional needs and disabilities across the Wokingham and Reading boroughs. Matches each child with a trained 1:1 volunteer buddy (2:1 when needed), free of charge, so they can join a mainstream activity of their choice once a week — Cubs, sports clubs, drama, swimming and more — building confidence, friendships and independence, and giving families weekly respite. No formal diagnosis required. Also runs youth participation groups (TeenW&Rd, Include Me2, Say YES). Must be a Wokingham or Reading Borough resident; apply via their website. Families pay activity costs; the volunteer support is free.", "ageMin": 5, "ageMax": 19, "accessibility": ["1:1 and 2:1 volunteer support at mainstream venues"], "needs": ["Autism", "ADHD", "Anxiety", "Speech & language", "Additional needs"], "cost": "Volunteer support free; families pay activity costs", "funding": ["Charity-funded", "Hardship support available"], "days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], "time": "Weekly, matched to your chosen activity", "contactName": "Me2 Club", "contactEmail": "", "contactPhone": "", "website": "https://me2club.org.uk", "notifyOnPublish": true, "factChecked": true, "ownerId": "seed", "category": "charity"},
  {"id": "south-hemispheres-ot", "name": "Hemispheres Occupational Therapy", "organisation": "Hemispheres", "type": "Therapy", "location": "Lightwater & Southampton", "postcode": "GU18", "lat": 51.3300, "lng": -0.7480, "description": "Private paediatric occupational therapy practice (established 2003) specialising in reflex integration, coordination, handwriting, sensory processing, attention and behaviour. Supports children with dyspraxia/DCD, autism, dyslexia, ADHD, learning disabilities, sensory processing difficulties and cerebral palsy. Main clinic in Lightwater, Surrey (open 4 days/week plus one Saturday a month) and a remote clinic on Thursdays in Shirley, Southampton, with online assessments also available. Free 20-minute consultation with a specialist therapist offered. Website: hemispheres.org.uk", "ageMin": 0, "ageMax": 18, "accessibility": ["Clinic and online consultations"], "needs": ["Dyspraxia/DCD", "Autism", "Dyslexia", "ADHD", "Sensory processing", "Cerebral palsy"], "cost": "Private — free 20-min initial consultation", "funding": ["Self-pay"], "days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Saturday"], "time": "By appointment; Southampton clinic Thursdays", "contactName": "Hemispheres", "contactEmail": "info@hemispheres.org.uk", "contactPhone": "01276 472858", "website": "https://hemispheres.org.uk", "notifyOnPublish": true, "factChecked": true, "ownerId": "seed", "category": "therapy"},
  {"id": "ch-variety", "name": "Variety — The Children's Charity", "organisation": "Variety, the Children's Charity", "type": "Social Skills", "location": "Nationwide UK", "postcode": "W1T 5DL", "lat": 52.5, "lng": -1.5, "description": "Funds wheelchairs, specialist equipment, Sunshine Coaches and days out for disabled and disadvantaged children across the UK. Website: variety.org.uk", "ageMin": 0, "ageMax": 18, "accessibility": ["Varies by venue"], "support": "Varies by need", "needs": ["Physical disability", "Learning disability", "Complex health needs", "Autism"], "cost": "Free — grants & activities", "funding": ["Charity grants available"], "days": ["Various"], "time": "Mon–Fri", "contactName": "Variety, the Children's Charity", "contactEmail": "Contact via website", "contactPhone": "020 7428 8100", "website": "https://www.variety.org.uk", "factChecked": false, "ownerId": "seed", "category": "charity"},
  {"id": "ch-rainbowtrust", "name": "Rainbow Trust — Family Support", "organisation": "Rainbow Trust Children's Charity", "type": "Social Skills", "location": "Nationwide UK", "postcode": "KT22 7TW", "lat": 51.2986, "lng": -0.3275, "description": "Provides emotional and practical support to families who have a child with a life-threatening or terminal illness, via dedicated Family Support Workers. Website: rainbowtrust.org.uk", "ageMin": 0, "ageMax": 18, "accessibility": ["Varies by venue"], "support": "Varies by need", "needs": ["Complex health needs", "Life-limiting conditions"], "cost": "Free — charity services", "funding": ["Fully funded"], "days": ["Various"], "time": "Mon–Fri", "contactName": "Rainbow Trust Children's Charity", "contactEmail": "Contact via website", "contactPhone": "01372 363438", "website": "https://www.rainbowtrust.org.uk", "factChecked": false, "ownerId": "seed", "category": "charity"},
  {"id": "ch-roalddahl", "name": "Roald Dahl's Marvellous Children's Charity", "organisation": "Roald Dahl's Marvellous Children's Charity", "type": "Social Skills", "location": "Nationwide UK", "postcode": "HP27 9PA", "lat": 52.5, "lng": -1.5, "description": "Funds specialist Roald Dahl Nurses for children with complex, lifelong conditions, providing medical and emotional support to the whole family. Website: roalddahlcharity.org", "ageMin": 0, "ageMax": 25, "accessibility": ["Varies by venue"], "support": "Varies by need", "needs": ["Complex health needs", "Epilepsy", "Neurological conditions"], "cost": "Free — charity services", "funding": ["Fully funded"], "days": ["Various"], "time": "Mon–Fri", "contactName": "Roald Dahl's Marvellous Children's Charity", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://www.roalddahlcharity.org", "factChecked": false, "ownerId": "seed", "category": "charity"},
  {"id": "ch-dreamscometrue", "name": "Dreams Come True", "organisation": "Dreams Come True", "type": "Social Skills", "location": "Nationwide UK", "postcode": "GU9 7XX", "lat": 52.5, "lng": -1.5, "description": "Grants dreams and creative experiences to children and young people with serious and life-limiting conditions across the UK. Website: dreamscometrue.uk.com", "ageMin": 4, "ageMax": 21, "accessibility": ["Varies by venue"], "support": "Varies by need", "needs": ["Complex health needs", "Life-limiting conditions", "Physical disability"], "cost": "Free — charity services", "funding": ["Fully funded"], "days": ["Various"], "time": "Mon–Fri", "contactName": "Dreams Come True", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://www.dreamscometrue.uk.com", "factChecked": false, "ownerId": "seed", "category": "charity"},
  {"id": "ch-makeawish", "name": "Make-A-Wish UK", "organisation": "Make-A-Wish Foundation UK", "type": "Social Skills", "location": "Nationwide UK", "postcode": "RH1 1YH", "lat": 52.5, "lng": -1.5, "description": "Creates life-changing wishes for children with critical illnesses across the UK. Website: make-a-wish.org.uk", "ageMin": 3, "ageMax": 18, "accessibility": ["Varies by venue"], "support": "Varies by need", "needs": ["Complex health needs", "Life-limiting conditions"], "cost": "Free — charity services", "funding": ["Fully funded"], "days": ["Various"], "time": "Mon–Fri", "contactName": "Make-A-Wish Foundation UK", "contactEmail": "Contact via website", "contactPhone": "01276 405060", "website": "https://www.make-a-wish.org.uk", "factChecked": false, "ownerId": "seed", "category": "charity"},
  {"id": "ch-meru", "name": "MERU — Bespoke Equipment", "organisation": "MERU", "type": "Social Skills", "location": "Tadworth", "postcode": "KT20 5RU", "lat": 51.2887, "lng": -0.2393, "description": "Designs and makes bespoke equipment, including the Bugzi powered wheelchair for very young children, to help disabled children play, communicate and gain independence. Website: meru.org.uk", "ageMin": 0, "ageMax": 18, "accessibility": ["Varies by venue"], "support": "Varies by need", "needs": ["Physical disability", "Cerebral palsy", "Communication difficulties"], "cost": "Free — charity services", "funding": ["Charity grants available"], "days": ["Various"], "time": "Mon–Fri", "contactName": "MERU", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://www.meru.org.uk", "factChecked": false, "ownerId": "seed", "category": "charity"},
  {"id": "ch-remap", "name": "Remap — Custom-Made Equipment", "organisation": "Remap", "type": "Social Skills", "location": "Nationwide UK", "postcode": "TN9 1RX", "lat": 52.5, "lng": -1.5, "description": "Volunteers design and make one-off custom equipment, free of charge, to help disabled children and adults with tasks that no commercial product can solve. Website: remap.org.uk", "ageMin": 0, "ageMax": 99, "accessibility": ["Varies by venue"], "support": "Varies by need", "needs": ["Physical disability", "Cerebral palsy", "Complex health needs"], "cost": "Free — charity services", "funding": ["Fully funded"], "days": ["Various"], "time": "Contact local panel", "contactName": "Remap", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://www.remap.org.uk", "factChecked": false, "ownerId": "seed", "category": "charity"},
  {"id": "ch-designability", "name": "Designability — Wizzybug Loans", "organisation": "Designability", "type": "Social Skills", "location": "Bath", "postcode": "BA2 3QD", "lat": 52.5, "lng": -1.5, "description": "Provides Wizzybug powered wheelchairs on free loan to young children, helping them explore and play independently. Website: designability.org.uk", "ageMin": 1, "ageMax": 5, "accessibility": ["Varies by venue"], "support": "Varies by need", "needs": ["Physical disability", "Cerebral palsy", "Muscular conditions"], "cost": "Free — charity loan scheme", "funding": ["Fully funded"], "days": ["Various"], "time": "Mon–Fri", "contactName": "Designability", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://designability.org.uk", "factChecked": false, "ownerId": "seed", "category": "charity"},
  {"id": "ch-downsassoc", "name": "Down's Syndrome Association", "organisation": "Down's Syndrome Association", "type": "Social Skills", "location": "Nationwide UK", "postcode": "TW11 9PS", "lat": 52.5, "lng": -1.5, "description": "Information, support and training for people with Down's syndrome, their families and professionals across England, Wales and Northern Ireland. Website: downs-syndrome.org.uk", "ageMin": 0, "ageMax": 99, "accessibility": ["Varies by venue"], "support": "Varies by need", "needs": ["Down's syndrome", "Learning disability", "Communication difficulties"], "cost": "Free helpline — services vary", "funding": ["Charity grants available"], "days": ["Various"], "time": "Helpline Mon–Fri", "contactName": "Down's Syndrome Association", "contactEmail": "Contact via website", "contactPhone": "0333 1212 300", "website": "https://www.downs-syndrome.org.uk", "factChecked": false, "ownerId": "seed", "category": "charity"},
  {"id": "ch-ndcs", "name": "National Deaf Children's Society", "organisation": "National Deaf Children's Society", "type": "Social Skills", "location": "Nationwide UK", "postcode": "SE1 2BS", "lat": 52.5, "lng": -1.5, "description": "Supports deaf children and their families with free information, a helpline, technology loans, events and family weekends. Website: ndcs.org.uk", "ageMin": 0, "ageMax": 25, "accessibility": ["Varies by venue"], "support": "Varies by need", "needs": ["Hearing impairment", "Communication difficulties"], "cost": "Free helpline — services vary", "funding": ["Charity grants available"], "days": ["Various"], "time": "Helpline Mon–Fri", "contactName": "National Deaf Children's Society", "contactEmail": "Contact via website", "contactPhone": "0808 800 8880", "website": "https://www.ndcs.org.uk", "factChecked": false, "ownerId": "seed", "category": "charity"},
  {"id": "ch-rsbc", "name": "Royal Society for Blind Children", "organisation": "Royal Society for Blind Children", "type": "Social Skills", "location": "Nationwide UK", "postcode": "E15 4PT", "lat": 52.5, "lng": -1.5, "description": "Supports blind and partially sighted children and young people with activities, family support, technology and life-skills programmes. Website: rsbc.org.uk", "ageMin": 0, "ageMax": 25, "accessibility": ["Varies by venue"], "support": "Varies by need", "needs": ["Visual impairment", "Sensory impairment"], "cost": "Free — charity services", "funding": ["Charity grants available"], "days": ["Various"], "time": "Mon–Fri", "contactName": "Royal Society for Blind Children", "contactEmail": "Contact via website", "contactPhone": "020 3198 0225", "website": "https://www.rsbc.org.uk", "factChecked": false, "ownerId": "seed", "category": "charity"},
  {"id": "ch-guidedogs-cyp", "name": "Guide Dogs — Children & Young People", "organisation": "Guide Dogs", "type": "Social Skills", "location": "Nationwide UK", "postcode": "RG7 3YG", "lat": 52.5, "lng": -1.5, "description": "Habilitation, family support and tailored services helping children and young people with vision impairment to build confidence and independence. Website: guidedogs.org.uk", "ageMin": 0, "ageMax": 25, "accessibility": ["Varies by venue"], "support": "Varies by need", "needs": ["Visual impairment", "Sensory impairment"], "cost": "Free — charity services", "funding": ["Fully funded"], "days": ["Various"], "time": "Mon–Fri", "contactName": "Guide Dogs", "contactEmail": "Contact via website", "contactPhone": "0800 781 1444", "website": "https://www.guidedogs.org.uk", "factChecked": false, "ownerId": "seed", "category": "charity"},
  {"id": "ch-youngepilepsy", "name": "Young Epilepsy", "organisation": "Young Epilepsy", "type": "Social Skills", "location": "Lingfield", "postcode": "RH7 6PW", "lat": 52.5, "lng": -1.5, "description": "National charity for children and young people with epilepsy and associated conditions, offering a helpline, information, a special school and college, and research. Website: youngepilepsy.org.uk", "ageMin": 0, "ageMax": 25, "accessibility": ["Varies by venue"], "support": "Varies by need", "needs": ["Epilepsy", "Learning disability", "Autism", "Neurological conditions"], "cost": "Free helpline — services vary", "funding": ["Charity grants available"], "days": ["Various"], "time": "Mon–Fri", "contactName": "Young Epilepsy", "contactEmail": "Contact via website", "contactPhone": "01342 832243", "website": "https://www.youngepilepsy.org.uk", "factChecked": false, "ownerId": "seed", "category": "charity"},
  {"id": "ch-epilepsyaction", "name": "Epilepsy Action", "organisation": "Epilepsy Action", "type": "Social Skills", "location": "Leeds", "postcode": "LS19 7XY", "lat": 53.8008, "lng": -1.5491, "description": "Advice, a freephone helpline and local support for people affected by epilepsy, including children and their families. Website: epilepsy.org.uk", "ageMin": 0, "ageMax": 99, "accessibility": ["Varies by venue"], "support": "Varies by need", "needs": ["Epilepsy", "Neurological conditions"], "cost": "Free helpline — services vary", "funding": ["Charity grants available"], "days": ["Various"], "time": "Helpline Mon–Fri", "contactName": "Epilepsy Action", "contactEmail": "Contact via website", "contactPhone": "0808 800 5050", "website": "https://www.epilepsy.org.uk", "factChecked": false, "ownerId": "seed", "category": "charity"},
  {"id": "ch-mduk", "name": "Muscular Dystrophy UK", "organisation": "Muscular Dystrophy UK", "type": "Social Skills", "location": "Nationwide UK", "postcode": "SE1 8RT", "lat": 52.5, "lng": -1.5, "description": "Support, information and a helpline for children and adults living with muscle-wasting conditions, plus grants towards equipment. Website: musculardystrophyuk.org", "ageMin": 0, "ageMax": 99, "accessibility": ["Varies by venue"], "support": "Varies by need", "needs": ["Muscular conditions", "Physical disability"], "cost": "Free helpline — services vary", "funding": ["Charity grants available"], "days": ["Various"], "time": "Helpline Mon–Fri", "contactName": "Muscular Dystrophy UK", "contactEmail": "Contact via website", "contactPhone": "0800 652 6352", "website": "https://www.musculardystrophyuk.org", "factChecked": false, "ownerId": "seed", "category": "charity"},
  {"id": "ch-shine", "name": "Shine — Spina Bifida & Hydrocephalus", "organisation": "Shine Charity", "type": "Social Skills", "location": "Nationwide UK", "postcode": "S63 9BL", "lat": 52.5, "lng": -1.5, "description": "Support from birth and throughout life for anyone affected by spina bifida and hydrocephalus, including specialist advisers for families. Website: shinecharity.org.uk", "ageMin": 0, "ageMax": 99, "accessibility": ["Varies by venue"], "support": "Varies by need", "needs": ["Spina bifida", "Hydrocephalus", "Physical disability"], "cost": "Free — charity services", "funding": ["Charity grants available"], "days": ["Various"], "time": "Mon–Fri", "contactName": "Shine Charity", "contactEmail": "Contact via website", "contactPhone": "01733 555988", "website": "https://www.shinecharity.org.uk", "factChecked": false, "ownerId": "seed", "category": "charity"},
  {"id": "ch-swanuk", "name": "SWAN UK — Undiagnosed Conditions", "organisation": "SWAN UK (Genetic Alliance UK)", "type": "Social Skills", "location": "Nationwide UK", "postcode": "EC1V 7DT", "lat": 52.5, "lng": -1.5, "description": "The only dedicated UK support network for families of children with syndromes without a name — undiagnosed genetic conditions. Website: undiagnosed.org.uk", "ageMin": 0, "ageMax": 25, "accessibility": ["Varies by venue"], "support": "Varies by need", "needs": ["Undiagnosed conditions", "Global development delay", "Complex health needs"], "cost": "Free — charity services", "funding": ["Fully funded"], "days": ["Various"], "time": "Online community", "contactName": "SWAN UK (Genetic Alliance UK)", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://www.undiagnosed.org.uk", "factChecked": false, "ownerId": "seed", "category": "charity"},
  {"id": "ch-unique", "name": "Unique — Rare Chromosome Disorders", "organisation": "Unique", "type": "Social Skills", "location": "Nationwide UK", "postcode": "CR3 5GN", "lat": 52.5, "lng": -1.5, "description": "Information and support for families affected by rare chromosome and gene disorders worldwide, including the UK. Website: rarechromo.org", "ageMin": 0, "ageMax": 99, "accessibility": ["Varies by venue"], "support": "Varies by need", "needs": ["Rare chromosome disorders", "Learning disability", "Global development delay"], "cost": "Free — charity services", "funding": ["Fully funded"], "days": ["Various"], "time": "Mon–Fri", "contactName": "Unique", "contactEmail": "Contact via website", "contactPhone": "01883 723356", "website": "https://www.rarechromo.org", "factChecked": false, "ownerId": "seed", "category": "charity"},
  {"id": "ch-climb", "name": "CLIMB — Metabolic Diseases", "organisation": "CLIMB (Children Living with Inherited Metabolic Diseases)", "type": "Social Skills", "location": "Nationwide UK", "postcode": "CW1 6GL", "lat": 52.5, "lng": -1.5, "description": "Information and family support for children living with inherited metabolic diseases across the UK. Website: climb.org.uk", "ageMin": 0, "ageMax": 25, "accessibility": ["Varies by venue"], "support": "Varies by need", "needs": ["Metabolic conditions", "Complex health needs", "Global development delay"], "cost": "Free — charity services", "funding": ["Fully funded"], "days": ["Various"], "time": "Mon–Fri", "contactName": "CLIMB (Children Living with Inherited Metabolic Diseases)", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://www.climb.org.uk", "factChecked": false, "ownerId": "seed", "category": "charity"},
  {"id": "ch-bliss", "name": "Bliss — Premature & Sick Babies", "organisation": "Bliss", "type": "Social Skills", "location": "Nationwide UK", "postcode": "E1 8FA", "lat": 52.5, "lng": -1.5, "description": "Supports families of babies born premature or sick, with information, neonatal support and a helpline. Website: bliss.org.uk", "ageMin": 0, "ageMax": 3, "accessibility": ["Varies by venue"], "support": "Varies by need", "needs": ["Premature birth", "Complex health needs", "Global development delay"], "cost": "Free — charity services", "funding": ["Fully funded"], "days": ["Various"], "time": "Mon–Fri", "contactName": "Bliss", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://www.bliss.org.uk", "factChecked": false, "ownerId": "seed", "category": "charity"},
  {"id": "ch-tourettes", "name": "Tourettes Action", "organisation": "Tourettes Action", "type": "Social Skills", "location": "Nationwide UK", "postcode": "SP10 3FB", "lat": 52.5, "lng": -1.5, "description": "Support, information and a helpline for children and adults with Tourette Syndrome and their families. Website: tourettes-action.org.uk", "ageMin": 0, "ageMax": 99, "accessibility": ["Varies by venue"], "support": "Varies by need", "needs": ["Tourette syndrome", "ADHD", "Anxiety", "Communication difficulties"], "cost": "Free helpline — services vary", "funding": ["Charity grants available"], "days": ["Various"], "time": "Helpline Mon–Fri", "contactName": "Tourettes Action", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://www.tourettes-action.org.uk", "factChecked": false, "ownerId": "seed", "category": "charity"},
  {"id": "ch-autistica", "name": "Autistica — Autism Research", "organisation": "Autistica", "type": "Social Skills", "location": "Nationwide UK", "postcode": "EC1V 4AB", "lat": 52.5, "lng": -1.5, "description": "The UK's national autism research charity, funding research and providing trusted information for autistic people and their families. Website: autistica.org.uk", "ageMin": 0, "ageMax": 99, "accessibility": ["Varies by venue"], "support": "Varies by need", "needs": ["Autism", "ADHD", "Anxiety", "Communication difficulties", "Sensory processing"], "cost": "Free — information & research", "funding": ["Fully funded"], "days": ["Various"], "time": "Online", "contactName": "Autistica", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://www.autistica.org.uk", "factChecked": false, "ownerId": "seed", "category": "charity"},
  {"id": "ch-annakennedy", "name": "Anna Kennedy Online — Autism", "organisation": "Anna Kennedy Online", "type": "Social Skills", "location": "Nationwide UK", "postcode": "HA5 1AB", "lat": 52.5, "lng": -1.5, "description": "Autism charity running awareness campaigns, an online support community, employment and arts projects for autistic children and adults. Website: annakennedyonline.com", "ageMin": 0, "ageMax": 99, "accessibility": ["Varies by venue"], "support": "Varies by need", "needs": ["Autism", "ADHD", "Anxiety", "Communication difficulties", "Sensory processing"], "cost": "Free — charity services", "funding": ["Charity grants available"], "days": ["Various"], "time": "Various", "contactName": "Anna Kennedy Online", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://www.annakennedyonline.com", "factChecked": false, "ownerId": "seed", "category": "charity"},
  {"id": "ch-resourcesforautism", "name": "Resources for Autism", "organisation": "Resources for Autism", "type": "Social Skills", "location": "London", "postcode": "NW4 3RX", "lat": 51.5072, "lng": -0.1276, "description": "Practical services for autistic children and adults including play schemes, youth clubs, music therapy and family support in London and the West Midlands. Website: resourcesforautism.org.uk", "ageMin": 0, "ageMax": 99, "accessibility": ["Varies by venue"], "support": "Varies by need", "needs": ["Autism", "ADHD", "Anxiety", "Communication difficulties", "Sensory processing", "Learning disability"], "cost": "Contact for pricing", "funding": ["Charity grants available", "Short Breaks funded"], "days": ["Various"], "time": "Various", "contactName": "Resources for Autism", "contactEmail": "Contact via website", "contactPhone": "020 8455 4786", "website": "https://resourcesforautism.org.uk", "factChecked": false, "ownerId": "seed", "category": "charity"},
  {"id": "ch-dyspraxia", "name": "Dyspraxia Foundation", "organisation": "Dyspraxia Foundation", "type": "Social Skills", "location": "Nationwide UK", "postcode": "SG5 1EG", "lat": 52.5, "lng": -1.5, "description": "Support and information for children and adults with dyspraxia / developmental coordination disorder and their families. Website: dyspraxiafoundation.org.uk", "ageMin": 0, "ageMax": 99, "accessibility": ["Varies by venue"], "support": "Varies by need", "needs": ["Dyspraxia", "DCD", "Sensory processing", "ADHD"], "cost": "Free — charity services", "funding": ["Charity grants available"], "days": ["Various"], "time": "Mon–Fri", "contactName": "Dyspraxia Foundation", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://dyspraxiafoundation.org.uk", "factChecked": false, "ownerId": "seed", "category": "charity"},
  {"id": "ch-bda", "name": "British Dyslexia Association", "organisation": "British Dyslexia Association", "type": "Social Skills", "location": "Nationwide UK", "postcode": "RG1 2EN", "lat": 52.5, "lng": -1.5, "description": "National helpline, information and accreditation supporting children and adults with dyslexia and other specific learning difficulties. Website: bdadyslexia.org.uk", "ageMin": 0, "ageMax": 99, "accessibility": ["Varies by venue"], "support": "Varies by need", "needs": ["Dyslexia", "SpLD", "ADHD", "Communication difficulties"], "cost": "Free helpline — services vary", "funding": ["Charity grants available"], "days": ["Various"], "time": "Helpline Mon–Fri", "contactName": "British Dyslexia Association", "contactEmail": "Contact via website", "contactPhone": "0333 405 4555", "website": "https://www.bdadyslexia.org.uk", "factChecked": false, "ownerId": "seed", "category": "charity"},
  {"id": "ch-fragilex", "name": "Fragile X Society", "organisation": "Fragile X Society", "type": "Social Skills", "location": "Nationwide UK", "postcode": "CO10 2PJ", "lat": 52.5, "lng": -1.5, "description": "Information, support and community for families affected by Fragile X syndrome across the UK. Website: fragilex.org.uk", "ageMin": 0, "ageMax": 99, "accessibility": ["Varies by venue"], "support": "Varies by need", "needs": ["Fragile X syndrome", "Learning disability", "Autism", "ADHD"], "cost": "Free — charity services", "funding": ["Fully funded"], "days": ["Various"], "time": "Mon–Fri", "contactName": "Fragile X Society", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://www.fragilex.org.uk", "factChecked": false, "ownerId": "seed", "category": "charity"},
  {"id": "ch-rettuk", "name": "Rett UK", "organisation": "Rett UK", "type": "Social Skills", "location": "Nationwide UK", "postcode": "CM20 1DR", "lat": 52.5, "lng": -1.5, "description": "The only UK charity dedicated to supporting families and professionals affected by Rett syndrome, with a helpline and family support. Website: rettuk.org", "ageMin": 0, "ageMax": 99, "accessibility": ["Varies by venue"], "support": "Varies by need", "needs": ["Rett syndrome", "Physical disability", "Communication difficulties", "Complex health needs"], "cost": "Free — charity services", "funding": ["Fully funded"], "days": ["Various"], "time": "Mon–Fri", "contactName": "Rett UK", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://www.rettuk.org", "factChecked": false, "ownerId": "seed", "category": "charity"},
  {"id": "ch-assert", "name": "ASSERT — Angelman Syndrome", "organisation": "ASSERT (Angelman Syndrome Support Education & Research Trust)", "type": "Social Skills", "location": "Nationwide UK", "postcode": "WS15 1LN", "lat": 52.5, "lng": -1.5, "description": "Support, information and family events for those affected by Angelman syndrome in the UK. Website: angelmanuk.org", "ageMin": 0, "ageMax": 99, "accessibility": ["Varies by venue"], "support": "Varies by need", "needs": ["Angelman syndrome", "Learning disability", "Communication difficulties", "Epilepsy"], "cost": "Free — charity services", "funding": ["Fully funded"], "days": ["Various"], "time": "Various", "contactName": "ASSERT (Angelman Syndrome Support Education & Research Trust)", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://www.angelmanuk.org", "factChecked": false, "ownerId": "seed", "category": "charity"},
  {"id": "ch-williams", "name": "Williams Syndrome Foundation", "organisation": "Williams Syndrome Foundation", "type": "Social Skills", "location": "Nationwide UK", "postcode": "CO4 9AS", "lat": 52.5, "lng": -1.5, "description": "Support, advice and family events for people affected by Williams syndrome across the UK. Website: williams-syndrome.org.uk", "ageMin": 0, "ageMax": 99, "accessibility": ["Varies by venue"], "support": "Varies by need", "needs": ["Williams syndrome", "Learning disability", "Communication difficulties"], "cost": "Free — charity services", "funding": ["Fully funded"], "days": ["Various"], "time": "Various", "contactName": "Williams Syndrome Foundation", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://www.williams-syndrome.org.uk", "factChecked": false, "ownerId": "seed", "category": "charity"},
  {"id": "ch-sibs", "name": "Sibs — Siblings of Disabled Children", "organisation": "Sibs", "type": "Social Skills", "location": "Nationwide UK", "postcode": "BD23 1NU", "lat": 52.5, "lng": -1.5, "description": "The UK charity for brothers and sisters of disabled children and adults, offering support, information and young-sibling groups. Website: sibs.org.uk", "ageMin": 0, "ageMax": 99, "accessibility": ["Varies by venue"], "support": "Varies by need", "needs": ["Sibling support", "All disabilities and conditions"], "cost": "Free — charity services", "funding": ["Fully funded"], "days": ["Various"], "time": "Mon–Fri", "contactName": "Sibs", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://www.sibs.org.uk", "factChecked": false, "ownerId": "seed", "category": "charity"},
  {"id": "ch-wellchild", "name": "WellChild — Children with Complex Needs", "organisation": "WellChild", "type": "Social Skills", "location": "Cheltenham", "postcode": "GL51 9SP", "lat": 52.5, "lng": -1.5, "description": "The national charity for seriously ill children, providing specialist nurses, home-adaptation projects and family support so children can be cared for at home. Website: wellchild.org.uk", "ageMin": 0, "ageMax": 18, "accessibility": ["Varies by venue"], "support": "Varies by need", "needs": ["Complex health needs", "Physical disability", "Life-limiting conditions"], "cost": "Free — charity services", "funding": ["Fully funded"], "days": ["Various"], "time": "Mon–Fri", "contactName": "WellChild", "contactEmail": "Contact via website", "contactPhone": "01242 530007", "website": "https://www.wellchild.org.uk", "factChecked": false, "ownerId": "seed", "category": "charity"},
  {"id": "ch-togetherforshortlives", "name": "Together for Short Lives", "organisation": "Together for Short Lives", "type": "Social Skills", "location": "Nationwide UK", "postcode": "BS1 6PL", "lat": 52.5, "lng": -1.5, "description": "The UK charity for children's palliative care, with a family helpline and a directory of children's hospices and services. Website: togetherforshortlives.org.uk", "ageMin": 0, "ageMax": 25, "accessibility": ["Varies by venue"], "support": "Varies by need", "needs": ["Life-limiting conditions", "Complex health needs"], "cost": "Free helpline — services vary", "funding": ["Fully funded"], "days": ["Various"], "time": "Helpline Mon–Fri", "contactName": "Together for Short Lives", "contactEmail": "Contact via website", "contactPhone": "0808 8088 100", "website": "https://www.togetherforshortlives.org.uk", "factChecked": false, "ownerId": "seed", "category": "charity"},
  {"id": "ch-honeypot", "name": "The Honeypot Children's Charity", "organisation": "The Honeypot Children's Charity", "type": "Social Skills", "location": "Nationwide UK", "postcode": "SW1V 1QT", "lat": 52.5, "lng": -1.5, "description": "Provides respite breaks and support to young carers and vulnerable children aged 5–12, including those caring for disabled family members. Website: honeypot.org.uk", "ageMin": 5, "ageMax": 12, "accessibility": ["Varies by venue"], "support": "Varies by need", "needs": ["Young carers", "Anxiety"], "cost": "Free — charity services", "funding": ["Fully funded"], "days": ["Various"], "time": "Various", "contactName": "The Honeypot Children's Charity", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://www.honeypot.org.uk", "factChecked": false, "ownerId": "seed", "category": "charity"},
  {"id": "ch-actionforchildren", "name": "Action for Children — Disabled Children's Services", "organisation": "Action for Children", "type": "Social Skills", "location": "Nationwide UK", "postcode": "WD18 8AG", "lat": 52.5, "lng": -1.5, "description": "Runs short breaks, family support and disabled children's services in communities across the UK. Website: actionforchildren.org.uk", "ageMin": 0, "ageMax": 18, "accessibility": ["Varies by venue"], "support": "Varies by need", "needs": ["All disabilities and conditions"], "cost": "Contact local service", "funding": ["Short Breaks funded", "Charity grants available"], "days": ["Various"], "time": "Various", "contactName": "Action for Children", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://www.actionforchildren.org.uk", "factChecked": false, "ownerId": "seed", "category": "charity"},
  {"id": "ch-pamis", "name": "PAMIS — Profound Disabilities (Scotland)", "organisation": "PAMIS", "type": "Social Skills", "location": "Dundee", "postcode": "DD1 4HN", "lat": 52.5, "lng": -1.5, "description": "Supports people with profound and multiple learning disabilities and their families across Scotland, including Changing Places campaigning. Website: pamis.org.uk", "ageMin": 0, "ageMax": 99, "accessibility": ["Varies by venue"], "support": "Varies by need", "needs": ["Profound and multiple learning disability", "Physical disability", "Complex health needs"], "cost": "Free — charity services", "funding": ["Fully funded"], "days": ["Various"], "time": "Mon–Fri", "contactName": "PAMIS", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://pamis.org.uk", "factChecked": false, "ownerId": "seed", "category": "charity"},
  {"id": "act-sealife-am", "name": "SEA LIFE Autism-Friendly Mornings", "organisation": "Merlin Entertainments (SEA LIFE)", "type": "Sensory", "location": "Birmingham", "postcode": "B1 2HL", "lat": 52.4862, "lng": -1.8904, "description": "Early-opening sensory-friendly mornings at SEA LIFE centres with music off, dimmed lighting and lowered TV volume for children with autism and sensory needs. Website: visitsealife.com", "ageMin": 0, "ageMax": 16, "accessibility": ["Wheelchair accessible", "Low-arousal environment", "Quiet space"], "support": "Varies by need", "needs": ["Autism", "ADHD", "Anxiety", "Communication difficulties", "Sensory processing"], "cost": "Standard entry — carer concessions", "funding": ["Contact provider"], "days": ["Various"], "time": "Selected mornings — see website", "contactName": "Merlin Entertainments (SEA LIFE)", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://www.visitsealife.com", "factChecked": false, "ownerId": "seed"},
  {"id": "act-legoland-relaxed", "name": "LEGOLAND Windsor Accessible Visits", "organisation": "Merlin Entertainments (LEGOLAND)", "type": "Sensory", "location": "Windsor", "postcode": "SL4 4AY", "lat": 51.4791, "lng": -0.6095, "description": "Ride-access passes, quiet rooms and carer concessions for children with autism, sensory and additional needs at LEGOLAND Windsor Resort. Website: legoland.co.uk", "ageMin": 2, "ageMax": 12, "accessibility": ["Wheelchair accessible", "Quiet space", "Ride access pass"], "support": "Varies by need", "needs": ["Autism", "ADHD", "Anxiety", "Communication difficulties", "Sensory processing", "Physical disability"], "cost": "Standard entry — carer concessions", "funding": ["Contact provider"], "days": ["Various"], "time": "During opening hours", "contactName": "Merlin Entertainments (LEGOLAND)", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://www.legoland.co.uk", "factChecked": false, "ownerId": "seed"},
  {"id": "act-inflatanation", "name": "Inflata Nation Autism-Friendly Sessions", "organisation": "Inflata Nation", "type": "Sports", "location": "Manchester", "postcode": "M17 1WA", "lat": 53.4808, "lng": -2.2426, "description": "Autism-friendly inflatable theme-park sessions with low music and reduced numbers; carers go free. Ten locations across the UK. Website: inflatanation.com", "ageMin": 3, "ageMax": 16, "accessibility": ["Low-arousal environment", "Quiet space"], "support": "Varies by need", "needs": ["Autism", "ADHD", "Anxiety", "Communication difficulties", "Sensory processing"], "cost": "Pay per session — carer free", "funding": ["Contact provider"], "days": ["Various"], "time": "Selected sessions — see website", "contactName": "Inflata Nation", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://www.inflatanation.com", "factChecked": false, "ownerId": "seed"},
  {"id": "act-diggerland", "name": "Diggerland Autism-Friendly Days", "organisation": "Diggerland", "type": "Sports", "location": "Kent", "postcode": "ME6 5LR", "lat": 52.5, "lng": -1.5, "description": "Construction-vehicle adventure parks with autism-trained staff and sensory rooms at some sites; carers admitted free. Parks in Kent, Devon, Durham and Yorkshire. Website: diggerland.com", "ageMin": 3, "ageMax": 16, "accessibility": ["Sensory room", "Quiet space"], "support": "Varies by need", "needs": ["Autism", "ADHD", "Anxiety", "Communication difficulties", "Sensory processing", "Physical disability"], "cost": "Standard entry — carer free", "funding": ["Contact provider"], "days": ["Various"], "time": "Selected days — see website", "contactName": "Diggerland", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://www.diggerland.com", "factChecked": false, "ownerId": "seed"},
  {"id": "act-discover", "name": "Discover Children's Story Centre — Sensory Sessions", "organisation": "Discover Children's Story Centre", "type": "Sensory", "location": "Stratford", "postcode": "E15 4BG", "lat": 51.5417, "lng": -0.003, "description": "Story-based play centre in Stratford with sensory-adapted and BSL sessions, social stories and quiet spaces for children with SEN and additional needs. Website: discover.org.uk", "ageMin": 0, "ageMax": 11, "accessibility": ["Sensory room", "Quiet space", "BSL sessions", "Step-free access"], "support": "Varies by need", "needs": ["Autism", "ADHD", "Anxiety", "Communication difficulties", "Sensory processing", "Communication difficulties", "Hearing impairment"], "cost": "Standard entry — carer concessions", "funding": ["Contact provider"], "days": ["Various"], "time": "Selected sessions", "contactName": "Discover Children's Story Centre", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://www.discover.org.uk", "factChecked": false, "ownerId": "seed"},
  {"id": "act-unicorn", "name": "Unicorn Theatre — Relaxed Performances", "organisation": "Unicorn Theatre", "type": "Drama", "location": "London", "postcode": "SE1 2HZ", "lat": 51.5072, "lng": -0.1276, "description": "London's leading theatre for young audiences, running relaxed performances with adjusted lighting and sound and freedom to move and make noise. Website: unicorntheatre.com", "ageMin": 2, "ageMax": 18, "accessibility": ["Wheelchair accessible", "Relaxed performances", "Quiet space"], "support": "Varies by need", "needs": ["Autism", "ADHD", "Anxiety", "Communication difficulties", "Sensory processing", "Learning disability", "Sensory processing"], "cost": "Tickets — concessions available", "funding": ["Contact provider"], "days": ["Various"], "time": "Selected performances", "contactName": "Unicorn Theatre", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://www.unicorntheatre.com", "factChecked": false, "ownerId": "seed"},
  {"id": "act-polka", "name": "Polka Theatre — Relaxed & Sensory Shows", "organisation": "Polka Theatre", "type": "Drama", "location": "Wimbledon", "postcode": "SW19 1SB", "lat": 51.4214, "lng": -0.2064, "description": "Dedicated children's theatre in Wimbledon offering relaxed and sensory performances designed for children with autism and additional needs. Website: polkatheatre.com", "ageMin": 0, "ageMax": 12, "accessibility": ["Wheelchair accessible", "Relaxed performances", "Quiet space"], "support": "Varies by need", "needs": ["Autism", "ADHD", "Anxiety", "Communication difficulties", "Sensory processing", "Sensory processing", "Learning disability"], "cost": "Tickets — concessions available", "funding": ["Contact provider"], "days": ["Various"], "time": "Selected performances", "contactName": "Polka Theatre", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://polkatheatre.com", "factChecked": false, "ownerId": "seed"},
  {"id": "act-littleangel", "name": "Little Angel Theatre — Relaxed Puppetry", "organisation": "Little Angel Theatre", "type": "Drama", "location": "Islington", "postcode": "N1 2DX", "lat": 51.5384, "lng": -0.0999, "description": "Puppet theatre in Islington running relaxed performances with low lighting and gentle sound for neurodivergent children and families. Website: littleangeltheatre.com", "ageMin": 0, "ageMax": 12, "accessibility": ["Relaxed performances", "Quiet space"], "support": "Varies by need", "needs": ["Autism", "ADHD", "Anxiety", "Communication difficulties", "Sensory processing", "Sensory processing"], "cost": "Tickets — concessions available", "funding": ["Contact provider"], "days": ["Various"], "time": "Selected performances", "contactName": "Little Angel Theatre", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://littleangeltheatre.com", "factChecked": false, "ownerId": "seed"},
  {"id": "act-oilycart", "name": "Oily Cart — Multi-Sensory Theatre", "organisation": "Oily Cart", "type": "Drama", "location": "Nationwide UK", "postcode": "SW17 0TW", "lat": 52.5, "lng": -1.5, "description": "Pioneering multi-sensory, interactive theatre touring the UK specifically for children with complex disabilities, autism and PMLD. Website: oilycart.org.uk", "ageMin": 0, "ageMax": 19, "accessibility": ["Multi-sensory", "Wheelchair accessible"], "support": "Varies by need", "needs": ["Profound and multiple learning disability", "Autism", "Sensory processing", "Physical disability", "Communication difficulties"], "cost": "Tickets — see venue", "funding": ["Contact provider"], "days": ["Various"], "time": "Touring — see website", "contactName": "Oily Cart", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://oilycart.org.uk", "factChecked": false, "ownerId": "seed"},
  {"id": "act-roundhouse", "name": "Roundhouse — Relaxed Performances", "organisation": "Roundhouse", "type": "Music", "location": "Camden", "postcode": "NW1 8EH", "lat": 51.543, "lng": -0.153, "description": "North London arts and music venue hosting relaxed performances and accessible creative workshops for young people. Website: roundhouse.org.uk", "ageMin": 8, "ageMax": 25, "accessibility": ["Wheelchair accessible", "Relaxed performances"], "support": "Varies by need", "needs": ["Autism", "ADHD", "Anxiety", "Communication difficulties", "Sensory processing", "Sensory processing"], "cost": "Tickets — concessions available", "funding": ["Contact provider"], "days": ["Various"], "time": "Selected events", "contactName": "Roundhouse", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://www.roundhouse.org.uk", "factChecked": false, "ownerId": "seed"},
  {"id": "act-cineworld-af", "name": "Cineworld Autism-Friendly Screenings", "organisation": "Cineworld (Dimensions)", "type": "Sensory", "location": "Nationwide UK", "postcode": "", "lat": 52.5, "lng": -1.5, "description": "Monthly sensory-friendly film screenings at 100+ Cineworld cinemas with lights up, low sound, no trailers and freedom to move and make noise. Website: cineworld.co.uk", "ageMin": 0, "ageMax": 18, "accessibility": ["Low-arousal environment", "Freedom to move"], "support": "Varies by need", "needs": ["Autism", "ADHD", "Anxiety", "Communication difficulties", "Sensory processing", "Learning disability"], "cost": "Standard ticket", "funding": ["Contact provider"], "days": ["Sunday"], "time": "First Sunday monthly, 11:00", "contactName": "Cineworld (Dimensions)", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://www.cineworld.co.uk/static/en/uk/accessibility/autism-friendly", "factChecked": false, "ownerId": "seed"},
  {"id": "act-odeon-sensory", "name": "ODEON Sensory-Friendly Screenings", "organisation": "ODEON Cinemas", "type": "Sensory", "location": "Nationwide UK", "postcode": "", "lat": 52.5, "lng": -1.5, "description": "Regular sensory-friendly screenings across ODEON cinemas with raised lighting and reduced volume for autistic and neurodivergent audiences. Website: odeon.co.uk", "ageMin": 0, "ageMax": 18, "accessibility": ["Low-arousal environment", "Freedom to move"], "support": "Varies by need", "needs": ["Autism", "ADHD", "Anxiety", "Communication difficulties", "Sensory processing", "Learning disability"], "cost": "Standard ticket", "funding": ["Contact provider"], "days": ["Various"], "time": "Selected screenings", "contactName": "ODEON Cinemas", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://www.odeon.co.uk", "factChecked": false, "ownerId": "seed"},
  {"id": "act-picturehouse-af", "name": "Picturehouse Autism-Friendly Screenings", "organisation": "Picturehouse (Dimensions)", "type": "Sensory", "location": "Nationwide UK", "postcode": "", "lat": 52.5, "lng": -1.5, "description": "Relaxed autism-friendly screenings of family films on the third Sunday each month, with adaptations to reduce anxiety and over-stimulation. Website: picturehouses.com", "ageMin": 0, "ageMax": 18, "accessibility": ["Low-arousal environment", "Freedom to move"], "support": "Varies by need", "needs": ["Autism", "ADHD", "Anxiety", "Communication difficulties", "Sensory processing", "Learning disability"], "cost": "Reduced ticket", "funding": ["Contact provider"], "days": ["Sunday"], "time": "Third Sunday monthly, morning", "contactName": "Picturehouse (Dimensions)", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://www.picturehouses.com/blog/autism-friendly-screenings", "factChecked": false, "ownerId": "seed"},
  {"id": "act-showcase-af", "name": "Showcase Autism-Friendly Screenings", "organisation": "Showcase Cinemas (Dimensions)", "type": "Sensory", "location": "Nationwide UK", "postcode": "", "lat": 52.5, "lng": -1.5, "description": "Monthly autism-friendly screenings across Showcase cinemas with adjusted light and sound and a relaxed, welcoming environment. Website: showcasecinemas.co.uk", "ageMin": 0, "ageMax": 18, "accessibility": ["Low-arousal environment", "Freedom to move"], "support": "Varies by need", "needs": ["Autism", "ADHD", "Anxiety", "Communication difficulties", "Sensory processing", "Learning disability"], "cost": "Standard ticket", "funding": ["Contact provider"], "days": ["Various"], "time": "Monthly — see website", "contactName": "Showcase Cinemas (Dimensions)", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://www.showcasecinemas.co.uk", "factChecked": false, "ownerId": "seed"},
  {"id": "act-calvert", "name": "Calvert Trust — Accessible Outdoor Activities", "organisation": "Calvert Trust / Calvert Lakes", "type": "Nature", "location": "Keswick", "postcode": "CA12 4RQ", "lat": 54.6013, "lng": -3.1347, "description": "Fully accessible outdoor adventure — climbing, canoeing, cycling and more — for disabled children, adults and families, with accessible accommodation. Website: calvert-trust.org.uk", "ageMin": 0, "ageMax": 99, "accessibility": ["Wheelchair accessible", "Hoist available", "Changing Places toilet", "Step-free access"], "support": "Varies by need", "needs": ["Physical disability", "Learning disability", "Sensory impairment", "Autism", "Cerebral palsy"], "cost": "Contact for pricing", "funding": ["Contact provider"], "days": ["Various"], "time": "Day & residential", "contactName": "Calvert Trust / Calvert Lakes", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://www.calvert-trust.org.uk", "factChecked": false, "ownerId": "seed"},
  {"id": "act-bendrigg", "name": "Bendrigg Trust — Inclusive Adventure", "organisation": "Bendrigg Trust", "type": "Nature", "location": "Kendal", "postcode": "LA8 0NR", "lat": 54.328, "lng": -2.746, "description": "Specialist residential and day outdoor-activity centre near Kendal providing inclusive adventure for disabled and disadvantaged children and adults. Website: bendrigg.org.uk", "ageMin": 5, "ageMax": 99, "accessibility": ["Wheelchair accessible", "Hoist available", "Step-free access"], "support": "Varies by need", "needs": ["Physical disability", "Learning disability", "Visual impairment", "Autism"], "cost": "Contact for pricing", "funding": ["Contact provider"], "days": ["Various"], "time": "Day & residential", "contactName": "Bendrigg Trust", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://www.bendrigg.org.uk", "factChecked": false, "ownerId": "seed"},
  {"id": "act-jubileesailing", "name": "Inclusive Tall-Ship Sailing", "organisation": "Jubilee Sailing Trust", "type": "Sports", "location": "Southampton", "postcode": "SO14 5QB", "lat": 52.5, "lng": -1.5, "description": "Inclusive tall-ship voyages where disabled and non-disabled young people sail side by side as equal crew. Website: jst.org.uk", "ageMin": 8, "ageMax": 99, "accessibility": ["Wheelchair accessible", "Step-free access"], "support": "Varies by need", "needs": ["Physical disability", "Visual impairment", "Learning disability"], "cost": "Contact for pricing", "funding": ["Contact provider"], "days": ["Various"], "time": "Voyages — see website", "contactName": "Jubilee Sailing Trust", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://jst.org.uk", "factChecked": false, "ownerId": "seed"},
  {"id": "act-wheelpower", "name": "WheelPower — Wheelchair Sport", "organisation": "WheelPower", "type": "Sports", "location": "Aylesbury", "postcode": "HP21 9PP", "lat": 51.8156, "lng": -0.8084, "description": "National charity for wheelchair sport, running inclusive sports events and taster days at Stoke Mandeville Stadium, the birthplace of the Paralympics. Website: wheelpower.org.uk", "ageMin": 5, "ageMax": 99, "accessibility": ["Wheelchair accessible", "Changing Places toilet", "Step-free access"], "support": "Varies by need", "needs": ["Physical disability", "Cerebral palsy", "Spina bifida", "Muscular conditions"], "cost": "Contact for pricing", "funding": ["Contact provider"], "days": ["Various"], "time": "Events — see website", "contactName": "WheelPower", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://www.wheelpower.org.uk", "factChecked": false, "ownerId": "seed"},
  {"id": "act-specialolympics", "name": "Special Olympics GB — Local Clubs", "organisation": "Special Olympics Great Britain", "type": "Sports", "location": "Nationwide UK", "postcode": "", "lat": 52.5, "lng": -1.5, "description": "Year-round sports training and competition for children and adults with intellectual disabilities through local clubs across Great Britain. Website: specialolympicsgb.org.uk", "ageMin": 8, "ageMax": 99, "accessibility": ["Varies by venue"], "support": "Varies by need", "needs": ["Learning disability", "Down's syndrome", "Autism"], "cost": "Contact local club", "funding": ["Contact provider"], "days": ["Various"], "time": "Weekly — local clubs", "contactName": "Special Olympics Great Britain", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://www.specialolympicsgb.org.uk", "factChecked": false, "ownerId": "seed"},
  {"id": "act-panathlon", "name": "Panathlon — Inclusive Competitions", "organisation": "Panathlon Challenge", "type": "Sports", "location": "Nationwide UK", "postcode": "", "lat": 52.5, "lng": -1.5, "description": "Provides disabled and disadvantaged young people with opportunities to take part in inclusive competitive sport in schools across England and Wales. Website: panathlon.com", "ageMin": 5, "ageMax": 19, "accessibility": ["Varies by venue"], "support": "Varies by need", "needs": ["Physical disability", "Learning disability", "Sensory impairment", "Autism"], "cost": "Free — school programmes", "funding": ["Fully funded"], "days": ["Various"], "time": "School terms", "contactName": "Panathlon Challenge", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://www.panathlon.com", "factChecked": false, "ownerId": "seed"},
  {"id": "act-accesssport", "name": "Access Sport — Inclusive Clubs", "organisation": "Access Sport", "type": "Sports", "location": "Nationwide UK", "postcode": "", "lat": 52.5, "lng": -1.5, "description": "Creates inclusive community sports clubs and disability sport opportunities for children and young people in under-served areas of the UK. Website: accesssport.org.uk", "ageMin": 5, "ageMax": 19, "accessibility": ["Varies by venue"], "support": "Varies by need", "needs": ["Physical disability", "Learning disability", "Autism", "Sensory impairment"], "cost": "Contact local club", "funding": ["Contact provider"], "days": ["Various"], "time": "Various — local clubs", "contactName": "Access Sport", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://www.accesssport.org.uk", "factChecked": false, "ownerId": "seed"},
  {"id": "act-cpsport", "name": "Cerebral Palsy Sport", "organisation": "Cerebral Palsy Sport", "type": "Sports", "location": "Nottingham", "postcode": "NG8 6AG", "lat": 52.9548, "lng": -1.1581, "description": "The country's leading disability sports charity supporting people with cerebral palsy to reach their sporting potential through events and resources. Website: cpsport.org", "ageMin": 5, "ageMax": 99, "accessibility": ["Wheelchair accessible"], "support": "Varies by need", "needs": ["Cerebral palsy", "Physical disability"], "cost": "Contact for details", "funding": ["Contact provider"], "days": ["Various"], "time": "Events — see website", "contactName": "Cerebral Palsy Sport", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://www.cpsport.org", "factChecked": false, "ownerId": "seed"},
  {"id": "act-britishblindsport", "name": "British Blind Sport — Have a Go", "organisation": "British Blind Sport", "type": "Sports", "location": "Leamington Spa", "postcode": "CV32 5YL", "lat": 52.5, "lng": -1.5, "description": "Helps blind and partially sighted children and adults get active through inclusive sport, including family 'Have a Go' days. Website: britishblindsport.org.uk", "ageMin": 5, "ageMax": 99, "accessibility": ["Varies by venue"], "support": "Varies by need", "needs": ["Visual impairment", "Sensory impairment"], "cost": "Contact for details", "funding": ["Contact provider"], "days": ["Various"], "time": "Events — see website", "contactName": "British Blind Sport", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://britishblindsport.org.uk", "factChecked": false, "ownerId": "seed"},
  {"id": "act-dsactive", "name": "DSActive — Sport for Down's Syndrome", "organisation": "Down's Syndrome Association (DSActive)", "type": "Sports", "location": "Nationwide UK", "postcode": "", "lat": 52.5, "lng": -1.5, "description": "Football, tennis and gymnastics sessions designed for children and adults with Down's syndrome through clubs across the UK. Website: dsactive.org", "ageMin": 5, "ageMax": 99, "accessibility": ["Varies by venue"], "support": "Varies by need", "needs": ["Down's syndrome", "Learning disability"], "cost": "Contact local club", "funding": ["Contact provider"], "days": ["Various"], "time": "Weekly — local clubs", "contactName": "Down's Syndrome Association (DSActive)", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://www.dsactive.org", "factChecked": false, "ownerId": "seed"},
  {"id": "act-frame-football", "name": "Frame Football Sessions", "organisation": "The Frame Football Association", "type": "Sports", "location": "Nationwide UK", "postcode": "", "lat": 52.5, "lng": -1.5, "description": "Football for children who use walking frames or have limited mobility, with inclusive sessions developing across the UK. Website: frame-football.com", "ageMin": 5, "ageMax": 18, "accessibility": ["Wheelchair accessible"], "support": "Varies by need", "needs": ["Cerebral palsy", "Physical disability"], "cost": "Contact local session", "funding": ["Contact provider"], "days": ["Various"], "time": "Weekly — local sessions", "contactName": "The Frame Football Association", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://www.frame-football.com", "factChecked": false, "ownerId": "seed"},
  {"id": "act-mishmash-sensory", "name": "Soundabout Sensory Music Clubs", "organisation": "Soundabout", "type": "Music", "location": "Nationwide UK", "postcode": "", "lat": 52.5, "lng": -1.5, "description": "Free online and community sensory music clubs for children and young people with severe and profound learning disabilities. Website: soundabout.org.uk", "ageMin": 0, "ageMax": 25, "accessibility": ["Varies by venue"], "support": "Varies by need", "needs": ["Profound and multiple learning disability", "Learning disability", "Sensory processing", "Communication difficulties"], "cost": "Free", "funding": ["Fully funded"], "days": ["Various"], "time": "Weekly — online & venues", "contactName": "Soundabout", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://soundabout.org.uk", "factChecked": false, "ownerId": "seed"},
  {"id": "th-maes", "category": "therapy", "name": "MAES Therapy (Neurodevelopmental)", "organisation": "MAES Therapy", "type": "Therapy", "location": "London", "postcode": "", "lat": 51.5072, "lng": -0.1276, "description": "Specialist hands-on neurodevelopmental therapy for children with cerebral palsy and motor learning difficulties, delivered by MAES-trained therapists. Find a therapist via their directory. Website: maes-therapy.com", "ageMin": 0, "ageMax": 18, "accessibility": ["Varies by therapist"], "support": "1:1 (staff to child)", "needs": ["Cerebral palsy", "Global development delay", "Physical disability", "Down's syndrome"], "cost": "Contact individual therapist", "funding": ["Self-pay"], "days": ["Various"], "time": "By appointment", "contactName": "MAES Therapy", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://www.maes-therapy.com", "factChecked": false, "ownerId": "seed"},
  {"id": "th-smallsteps", "category": "therapy", "name": "Early Intervention — Small Steps", "organisation": "Small Steps", "type": "Therapy", "location": "London", "postcode": "SW18 4HR", "lat": 51.4571, "lng": -0.191, "description": "Early-intervention charity for under-fives with cerebral palsy and motor disabilities in London, combining conductive education, physiotherapy and occupational therapy with family support. Website: smallsteps.org.uk", "ageMin": 0, "ageMax": 5, "accessibility": ["Wheelchair accessible", "Step-free access", "Sensory room"], "support": "1:1 (staff to child)", "needs": ["Cerebral palsy", "Physical disability", "Global development delay", "Down's syndrome"], "cost": "Free / charity funded", "funding": ["Charity grants available"], "days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], "time": "Term time", "contactName": "Small Steps", "contactEmail": "Contact via website", "contactPhone": "020 8870 2086", "website": "https://www.smallsteps.org.uk", "factChecked": false, "ownerId": "seed"},
  {"id": "th-advance-scotson", "category": "therapy", "name": "The Scotson Technique — Advance Centre", "organisation": "The Advance Centre", "type": "Therapy", "location": "Hemel Hempstead", "postcode": "HP2 7DE", "lat": 51.7538, "lng": -0.4218, "description": "Gentle breathing-and-movement programme (the Scotson Technique) taught to parents to support children with cerebral palsy and neurological conditions at home. Website: advancecentre.org.uk", "ageMin": 0, "ageMax": 18, "accessibility": ["Step-free access"], "support": "Parent-delivered programme", "needs": ["Cerebral palsy", "Physical disability", "Global development delay", "Complex health needs"], "cost": "Contact for pricing", "funding": ["Charity grants available", "Self-pay"], "days": ["Various"], "time": "By appointment", "contactName": "The Advance Centre", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://www.advancecentre.org.uk", "factChecked": false, "ownerId": "seed"},
  {"id": "th-footprints-ce", "category": "therapy", "name": "Conductive Education — Footprints", "organisation": "Footprints Conductive Education Centre", "type": "Therapy", "location": "Nottingham", "postcode": "NG8 6AG", "lat": 52.9548, "lng": -1.1581, "description": "Conductive education and therapy for babies, children and adults with cerebral palsy, stroke and neurological conditions in Nottingham. Website: footprintscec.org", "ageMin": 0, "ageMax": 99, "accessibility": ["Wheelchair accessible", "Step-free access", "Changing Places toilet"], "support": "1:2 (staff to child)", "needs": ["Cerebral palsy", "Physical disability", "Global development delay", "Acquired brain injury"], "cost": "Contact for pricing", "funding": ["Charity grants available"], "days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], "time": "By appointment", "contactName": "Footprints CEC", "contactEmail": "Contact via website", "contactPhone": "0115 942 4742", "website": "https://www.footprintscec.org", "factChecked": false, "ownerId": "seed"},
  {"id": "th-kidsphysio-london", "category": "therapy", "name": "DMI Paediatric Physiotherapy", "organisation": "Kids Physio London", "type": "Therapy", "location": "London", "postcode": "", "lat": 51.5072, "lng": -0.1276, "description": "Private paediatric physiotherapy clinic in London offering Dynamic Movement Intervention for children with gross motor impairments and neurological conditions. Website: kidsphysiolondon.co.uk", "ageMin": 0, "ageMax": 18, "accessibility": ["Varies by venue"], "support": "1:1 (staff to child)", "needs": ["Cerebral palsy", "Physical disability", "Global development delay"], "cost": "Contact for pricing", "funding": ["Self-pay"], "days": ["Various"], "time": "By appointment", "contactName": "Kids Physio London", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://kidsphysiolondon.co.uk/all-services/dynamic-movement-intervention-dmi/", "factChecked": false, "ownerId": "seed"},
  {"id": "th-suresteps", "category": "therapy", "name": "DMI — Sure Steps Children's Physiotherapy", "organisation": "Sure Steps Children's Physiotherapy", "type": "Therapy", "location": "Nationwide UK", "postcode": "", "lat": 52.5, "lng": -1.5, "description": "Private paediatric physiotherapy practice offering Dynamic Movement Intervention for babies and children with motor impairments including cerebral palsy and developmental delay, with home and clinic sessions. Website: surestepschildrensphysiotherapy.co.uk", "ageMin": 0, "ageMax": 18, "accessibility": ["Home visits available"], "support": "1:1 (staff to child)", "needs": ["Cerebral palsy", "Physical disability", "Global development delay", "Down's syndrome"], "cost": "Contact for pricing", "funding": ["Self-pay"], "days": ["Various"], "time": "By appointment", "contactName": "Sure Steps Children's Physiotherapy", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://surestepschildrensphysiotherapy.co.uk/dmi-embracing-dynamic-movement-intervention/", "factChecked": false, "ownerId": "seed"},
  {"id": "th-napa", "category": "therapy", "name": "DMI Intensive Therapy — NAPA Centre", "organisation": "NAPA Centre", "type": "Therapy", "location": "London", "postcode": "", "lat": 51.5072, "lng": -0.1276, "description": "Private paediatric therapy centre offering Dynamic Movement Intervention and intensive multi-disciplinary therapy blocks for children with gross motor impairments and neurological conditions. Website: napacentre.co.uk", "ageMin": 0, "ageMax": 18, "accessibility": ["Wheelchair accessible"], "support": "1:1 (staff to child)", "needs": ["Cerebral palsy", "Physical disability", "Global development delay", "Acquired brain injury"], "cost": "Contact for pricing", "funding": ["Self-pay", "EHCP funded"], "days": ["Various"], "time": "By appointment", "contactName": "NAPA Centre", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://napacentre.co.uk/therapy-tools/dmi/", "factChecked": false, "ownerId": "seed"},
  {"id": "th-bumblebee", "category": "therapy", "name": "Neuro Paediatric Physiotherapy — Bumble Bee Physio", "organisation": "Bumble Bee Physio", "type": "Therapy", "location": "London", "postcode": "", "lat": 51.5503, "lng": -0.1737, "description": "Specialist neuro paediatric physiotherapy in London for children with Rett syndrome, cerebral palsy, Angelman syndrome, autism and Down's syndrome, including DMI and Targeted Training. Website: bumblebeephysio.co.uk", "ageMin": 0, "ageMax": 18, "accessibility": ["Home visits available"], "support": "1:1 (staff to child)", "needs": ["Cerebral palsy", "Physical disability", "Rett syndrome", "Down's syndrome", "Autism"], "cost": "Contact for pricing", "funding": ["Self-pay", "EHCP funded"], "days": ["Various"], "time": "By appointment", "contactName": "Bumble Bee Physio", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://bumblebeephysio.co.uk", "factChecked": false, "ownerId": "seed"},
  {"id": "th-mcr-neurophysio", "category": "therapy", "name": "Paediatric Neuro Physiotherapy", "organisation": "Manchester Neuro Physio", "type": "Therapy", "location": "Manchester", "postcode": "", "lat": 53.4235, "lng": -2.3217, "description": "Specialist paediatric neuro physiotherapy in Manchester and Sale for children aged 0–18 with cerebral palsy and other neurological and developmental disorders, with clinic and home-visit options. Website: manchesterneurophysio.co.uk", "ageMin": 0, "ageMax": 18, "accessibility": ["Home visits available"], "support": "1:1 (staff to child)", "needs": ["Cerebral palsy", "Physical disability", "Global development delay"], "cost": "Contact for pricing", "funding": ["Self-pay", "Insurer-funded"], "days": ["Various"], "time": "By appointment", "contactName": "Manchester Neuro Physio", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://manchesterneurophysio.co.uk/paediatrics/", "factChecked": false, "ownerId": "seed"},
  {"id": "th-physiocouk", "category": "therapy", "name": "Paediatric Physio, Hydrotherapy & Rebound — Physio.co.uk", "organisation": "Physio.co.uk", "type": "Therapy", "location": "Manchester", "postcode": "", "lat": 53.4808, "lng": -2.2426, "description": "Specialist paediatric physiotherapy across Manchester, Sale, Salford and Stockport including hydrotherapy, rebound therapy and sensory approaches for children with cerebral palsy, autism and learning difficulties. Website: physio.co.uk", "ageMin": 0, "ageMax": 18, "accessibility": ["Wheelchair accessible", "Hydrotherapy pool"], "support": "1:1 (staff to child)", "needs": ["Cerebral palsy", "Autism", "Learning disability", "Sensory processing"], "cost": "Contact for pricing", "funding": ["Self-pay", "Insurer-funded"], "days": ["Various"], "time": "By appointment", "contactName": "Physio.co.uk", "contactEmail": "Contact via website", "contactPhone": "0330 088 7800", "website": "https://physio.co.uk/treatments/paediatric-physiotherapy/", "factChecked": false, "ownerId": "seed"},
  {"id": "th-cpkids-physio", "category": "therapy", "name": "Cerebral Palsy Paediatric Physiotherapy", "organisation": "CP Kids Physio", "type": "Therapy", "location": "Birmingham", "postcode": "", "lat": 52.4497, "lng": -1.8749, "description": "Private paediatric physiotherapy specialising in cerebral palsy and movement disorders for babies and children in Birmingham and Worcestershire. Website: cpkids-physio.co.uk", "ageMin": 0, "ageMax": 18, "accessibility": ["Home visits available"], "support": "1:1 (staff to child)", "needs": ["Cerebral palsy", "Physical disability", "Global development delay"], "cost": "Contact for pricing", "funding": ["Self-pay", "EHCP funded"], "days": ["Various"], "time": "By appointment", "contactName": "CP Kids Physio", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://cpkids-physio.co.uk/about", "factChecked": false, "ownerId": "seed"},
  {"id": "th-cnphys", "category": "therapy", "name": "Specialist Cerebral Palsy Physiotherapy", "organisation": "Children's Neuro Physio", "type": "Therapy", "location": "London", "postcode": "", "lat": 51.3944, "lng": -0.3041, "description": "Specialist paediatric neuro physiotherapy for children with cerebral palsy (GMFCS I–V), brain and nerve injuries and neuromuscular disorders, serving South London and Surrey via clinic and case-managed home visits. Website: cnphys.co.uk", "ageMin": 0, "ageMax": 18, "accessibility": ["Home visits available"], "support": "1:1 (staff to child)", "needs": ["Cerebral palsy", "Physical disability", "Acquired brain injury", "Muscular conditions"], "cost": "Contact for pricing", "funding": ["Self-pay", "Case-managed", "Insurer-funded"], "days": ["Various"], "time": "By appointment", "contactName": "Children's Neuro Physio", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://cnphys.co.uk/treatment/locations/south-london/", "factChecked": false, "ownerId": "seed"},
  {"id": "th-steps-ce", "category": "therapy", "name": "Conductive Education — Steps Centre", "organisation": "Steps Conductive Education Centre", "type": "Therapy", "location": "Shepshed", "postcode": "LE12 9DN", "lat": 52.7688, "lng": -1.2868, "description": "Free weekly conductive-education sessions for children with cerebral palsy, Down's syndrome and motor delay in Shepshed, Loughborough. One of a network of independent CE charities across the UK. Website: stepscentre.org", "ageMin": 0, "ageMax": 18, "accessibility": ["Wheelchair accessible", "Step-free access"], "support": "1:3 (staff to child)", "needs": ["Cerebral palsy", "Down's syndrome", "Global development delay", "Physical disability"], "cost": "Free (charity funded)", "funding": ["Fully funded", "Charity grants available"], "days": ["Various"], "time": "Weekly sessions — contact for schedule", "contactName": "Steps Conductive Education Centre", "contactEmail": "info@stepscentre.org.uk", "contactPhone": "01509 506878", "website": "https://www.stepscentre.org", "factChecked": true, "ownerId": "seed"},
  {"id": "th-rosewalton", "category": "therapy", "name": "Conductive Education — Rose Walton Centre", "organisation": "The Rose Walton Centre", "type": "Therapy", "location": "Redbridge", "postcode": "", "lat": 51.5609, "lng": 0.0815, "description": "Early-years conductive-education, physiotherapy, speech and sensory support for children aged 0–8 with cerebral palsy and motor learning needs in East London. Website: via Redbridge Local Offer", "ageMin": 0, "ageMax": 8, "accessibility": ["Wheelchair accessible", "Step-free access"], "support": "1:2 (staff to child)", "needs": ["Cerebral palsy", "Global development delay", "Physical disability", "Communication difficulties"], "cost": "Contact for placement", "funding": ["EHCP funded", "Charity grants available"], "days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], "time": "Term time — contact for details", "contactName": "The Rose Walton Centre", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://find.redbridge.gov.uk", "factChecked": false, "ownerId": "seed"},
  {"id": "th-buddybear", "category": "therapy", "name": "Conductive Education — Buddy Bear Trust", "organisation": "Buddy Bear Trust", "type": "Therapy", "location": "Dungannon", "postcode": "BT71 6DE", "lat": 54.5088, "lng": -6.7655, "description": "Northern Ireland's dedicated conductive-education school for children and young people with cerebral palsy and motor disorders aged 0–25, in Dungannon, Co. Tyrone. Website: buddybeartrust.com", "ageMin": 0, "ageMax": 25, "accessibility": ["Wheelchair accessible", "Step-free access", "Changing Places toilet"], "support": "1:2 (staff to child)", "needs": ["Cerebral palsy", "Physical disability", "Global development delay", "Down's syndrome"], "cost": "Contact / referral", "funding": ["EHCP funded", "Charity grants available"], "days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], "time": "Term time", "contactName": "Buddy Bear Trust", "contactEmail": "principal@buddybeartrust.com", "contactPhone": "028 8775 2025", "website": "https://buddybeartrust.com/contact-us/", "factChecked": true, "ownerId": "seed"},
  {"id": "th-kidsinsyncsw", "category": "therapy", "name": "Paediatric OT & Sensory Integration", "organisation": "Kids in Sync South West", "type": "Sensory", "location": "Twickenham", "postcode": "", "lat": 51.449, "lng": -0.3378, "description": "Private paediatric occupational therapy and Ayres Sensory Integration for children aged 0–14 with sensory processing difficulties, autism and ADHD, with clinic sessions in Twickenham. Website: kidsinsyncsw.com", "ageMin": 0, "ageMax": 14, "accessibility": ["Step-free access"], "support": "1:1 (staff to child)", "needs": ["Sensory processing", "Autism", "ADHD", "Global development delay"], "cost": "Contact for pricing", "funding": ["Self-pay", "EHCP funded"], "days": ["Various"], "time": "By appointment", "contactName": "Kids in Sync South West", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://kidsinsyncsw.com", "factChecked": false, "ownerId": "seed"},
  {"id": "th-sensory-therapy-mids", "category": "therapy", "name": "Paediatric OT & Sensory Attachment Intervention", "organisation": "Children's Sensory Therapy", "type": "Sensory", "location": "Birmingham", "postcode": "", "lat": 52.4862, "lng": -1.8904, "description": "Paediatric occupational therapy specialising in Ayres Sensory Integration and Sensory Attachment Intervention for children with sensory processing difficulties, autism, ADHD and trauma across the Midlands. Website: childrenssensorytherapy.co.uk", "ageMin": 0, "ageMax": 18, "accessibility": ["Home visits available", "School visits available"], "support": "1:1 (staff to child)", "needs": ["Sensory processing", "Autism", "ADHD", "Anxiety"], "cost": "Contact for pricing", "funding": ["Self-pay", "EHCP funded", "School-commissioned"], "days": ["Various"], "time": "By appointment", "contactName": "Children's Sensory Therapy", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://childrenssensorytherapy.co.uk/about-us/", "factChecked": false, "ownerId": "seed"},
  {"id": "th-sensorychildren", "category": "therapy", "name": "Paediatric OT, Sensory Integration & Feeding Therapy", "organisation": "Sensory Children", "type": "Sensory", "location": "Nationwide UK", "postcode": "", "lat": 52.5, "lng": -1.5, "description": "Private paediatric occupational therapy offering sensory integration and specialist feeding therapy for children with sensory processing difficulties and feeding challenges, with UK-wide coverage. Website: sensorychildren.co.uk", "ageMin": 0, "ageMax": 18, "accessibility": ["Home visits available", "School visits available"], "support": "1:1 (staff to child)", "needs": ["Sensory processing", "Autism", "ADHD", "Communication difficulties"], "cost": "Contact for pricing", "funding": ["Self-pay", "EHCP funded"], "days": ["Various"], "time": "By appointment", "contactName": "Sensory Children", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://sensorychildren.co.uk", "factChecked": false, "ownerId": "seed"},
  {"id": "th-seirrah", "category": "therapy", "name": "OT, SLT & Sensory Integration — Seirrah Therapies", "organisation": "Seirrah Therapies", "type": "Sensory", "location": "Cardiff", "postcode": "", "lat": 51.4816, "lng": -3.1791, "description": "Private paediatric occupational therapy, speech and language therapy and sensory integration in Cardiff for children and young people aged 0–25 with DCD/dyspraxia, autism and SEN. Website: seirrah-ot.co.uk", "ageMin": 0, "ageMax": 25, "accessibility": ["Step-free access"], "support": "1:1 (staff to child)", "needs": ["Sensory processing", "Autism", "ADHD", "Communication difficulties", "Learning disability"], "cost": "Contact for pricing", "funding": ["Self-pay", "EHCP funded"], "days": ["Various"], "time": "By appointment", "contactName": "Seirrah Therapies", "contactEmail": "enquiries@seirrah-ot.co.uk", "contactPhone": "02920 023314", "website": "https://seirrah-ot.co.uk/about-us/", "factChecked": true, "ownerId": "seed"},
  {"id": "th-maximumpotential", "category": "therapy", "name": "OT, Physio & Sensory Integration — Maximum Potential", "organisation": "Maximum Potential", "type": "Sensory", "location": "London", "postcode": "", "lat": 51.5178, "lng": -0.1497, "description": "Private multi-disciplinary clinic on Harley Street offering occupational therapy, physiotherapy, speech and language therapy and sensory integration for children with sensory processing disorder and neurodevelopmental delays. Website: maximumpotential.org.uk", "ageMin": 0, "ageMax": 18, "accessibility": ["Wheelchair accessible", "Step-free access"], "support": "1:1 (staff to child)", "needs": ["Sensory processing", "Autism", "ADHD", "Global development delay", "Physical disability"], "cost": "Contact for pricing", "funding": ["Self-pay", "EHCP funded"], "days": ["Various"], "time": "By appointment", "contactName": "Maximum Potential", "contactEmail": "Contact via website", "contactPhone": "020 7486 4747", "website": "https://maximumpotential.org.uk", "factChecked": false, "ownerId": "seed"},
  {"id": "th-hemispheres", "category": "therapy", "name": "Paediatric OT & Reflex Integration", "organisation": "Hemispheres", "type": "Sensory", "location": "Lightwater", "postcode": "", "lat": 51.3489, "lng": -0.6724, "description": "Private paediatric occupational therapy and reflex-integration programmes for children with coordination, attention, sensory and learning difficulties, at clinics in Lightwater, Surrey and Southampton. Website: hemispheres.org.uk", "ageMin": 0, "ageMax": 18, "accessibility": ["Step-free access"], "support": "1:1 (staff to child)", "needs": ["Sensory processing", "ADHD", "Learning disability", "Anxiety"], "cost": "Contact for pricing", "funding": ["Self-pay", "EHCP funded"], "days": ["Various"], "time": "By appointment", "contactName": "Hemispheres", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://hemispheres.org.uk", "factChecked": false, "ownerId": "seed"},
  {"id": "th-artsforlife", "category": "therapy", "name": "Art Therapy — Arts For Life Project", "organisation": "Arts For Life Project", "type": "Therapy", "location": "London", "postcode": "", "lat": 51.6093, "lng": -0.4228, "description": "Art therapy charity supporting young people aged 8–24 with autism, ADHD, anxiety and depression through individual and group creative-arts sessions in Northwood, London. Website: artsforlifeproject.org", "ageMin": 8, "ageMax": 24, "accessibility": ["Step-free access"], "support": "1:1 and small groups", "needs": ["Autism", "ADHD", "Anxiety", "Learning disability"], "cost": "Contact — charity funded", "funding": ["Charity grants available", "Fully funded"], "days": ["Various"], "time": "Contact for details", "contactName": "Arts For Life Project", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://artsforlifeproject.org", "factChecked": false, "ownerId": "seed"},
  {"id": "th-artstherapies-schools", "category": "therapy", "name": "Art Therapy in Schools", "organisation": "Arts Therapies for Children", "type": "Therapy", "location": "London", "postcode": "", "lat": 51.5072, "lng": -0.1276, "description": "Charity delivering art therapy in primary schools across London, Manchester and Hertfordshire for children experiencing trauma, anxiety, autism, ADHD and attachment difficulties. Website: artstherapies.org.uk", "ageMin": 4, "ageMax": 11, "accessibility": ["School-based"], "support": "1:1 and small groups", "needs": ["Autism", "ADHD", "Anxiety", "Learning disability", "Communication difficulties"], "cost": "School SENDCo referral", "funding": ["School-commissioned", "Charity grants available"], "days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], "time": "Term time", "contactName": "Arts Therapies for Children", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://artstherapies.org.uk/about-us/", "factChecked": false, "ownerId": "seed"},
  {"id": "th-coram-creative", "category": "therapy", "name": "Art, Music & Drama Therapy — Coram", "organisation": "Coram", "type": "Therapy", "location": "London", "postcode": "", "lat": 51.5259, "lng": -0.1176, "description": "Creative therapies (art, music and drama therapy) for children and young people at the Coram Campus, supporting those with SEND, adoption/special guardianship and emotional or social development needs. Website: coram.org.uk", "ageMin": 0, "ageMax": 25, "accessibility": ["Wheelchair accessible", "Step-free access"], "support": "1:1 and group", "needs": ["Autism", "ADHD", "Anxiety", "Learning disability", "Communication difficulties"], "cost": "School/LA referral", "funding": ["School-commissioned", "Charity grants available", "Fully funded"], "days": ["Various"], "time": "By referral", "contactName": "Coram Creative Therapies", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://coram.org.uk/what-we-do/our-work-and-impact/creative-therapies/", "factChecked": false, "ownerId": "seed"},
  {"id": "th-bapt", "category": "therapy", "name": "Play Therapy Register — BAPT", "organisation": "British Association of Play Therapists", "type": "Therapy", "location": "Weybridge", "postcode": "KT13 9DZ", "lat": 51.3701, "lng": -0.4562, "description": "The leading national register of accredited play and creative-arts therapists for children and young people with emotional, behavioural and developmental difficulties including SEND, trauma and autism. Website: bapt.info", "ageMin": 0, "ageMax": 18, "accessibility": ["Varies by therapist"], "support": "1:1 (therapist to child)", "needs": ["Autism", "ADHD", "Anxiety", "Learning disability", "Communication difficulties"], "cost": "Contact individual therapist", "funding": ["Self-pay", "EHCP funded", "School-commissioned"], "days": ["Various"], "time": "By appointment", "contactName": "BAPT", "contactEmail": "info@bapt.uk.com", "contactPhone": "01932 828638", "website": "https://bapt.info", "factChecked": true, "ownerId": "seed"},
  {"id": "th-roundabout-drama", "category": "therapy", "name": "Drama Therapy in Schools — Roundabout", "organisation": "Roundabout Dramatherapy", "type": "Drama", "location": "London", "postcode": "", "lat": 51.5072, "lng": -0.1276, "description": "Charity delivering drama therapy in London schools for children and young people with ASC, ADHD, PMLD and emotional/behavioural difficulties, via SENDCo referral. Website: roundaboutdramatherapy.org.uk", "ageMin": 3, "ageMax": 19, "accessibility": ["School-based"], "support": "Small groups and 1:1", "needs": ["Autism", "ADHD", "Profound and multiple learning disability", "Anxiety", "Communication difficulties"], "cost": "School SENDCo referral", "funding": ["School-commissioned", "Charity grants available"], "days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], "time": "Term time", "contactName": "Roundabout Dramatherapy", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://roundaboutdramatherapy.org.uk/about/", "factChecked": false, "ownerId": "seed"},
  {"id": "th-cp-england", "category": "therapy", "name": "Bobath Therapy — Cerebral Palsy England", "organisation": "Cerebral Palsy England", "type": "Therapy", "location": "Watford", "postcode": "", "lat": 51.6565, "lng": -0.3903, "description": "Therapist-led successor to the National Bobath Cerebral Palsy Centre (which closed May 2024), continuing to deliver Bobath-based physiotherapy, OT and SLT for children and adults with cerebral palsy and neurological conditions. Website: cerebralpalsyengland.com", "ageMin": 0, "ageMax": 99, "accessibility": ["Wheelchair accessible", "Step-free access"], "support": "1:1 (staff to child)", "needs": ["Cerebral palsy", "Physical disability", "Acquired brain injury", "Global development delay"], "cost": "Contact for pricing", "funding": ["Self-pay", "EHCP funded", "Charity grants available"], "days": ["Various"], "time": "By appointment", "contactName": "Cerebral Palsy England", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://cerebralpalsyengland.com", "factChecked": false, "ownerId": "seed"},
  {"id": "th-heelandtoe", "category": "therapy", "name": "Multi-Therapy Centre — Heel and Toe", "organisation": "Heel and Toe Children's Charity", "type": "Therapy", "location": "Chester-le-Street", "postcode": "DH2 1DE", "lat": 54.8529, "lng": -1.5728, "description": "North-East children's charity offering conductive education, hydrotherapy, hippotherapy, rebound therapy, sensory integration, physiotherapy and speech and language therapy for children aged 6 months to 19 years with cerebral palsy, dyspraxia and complex needs. Website: heelandtoe.org.uk", "ageMin": 0, "ageMax": 19, "accessibility": ["Wheelchair accessible", "Hydrotherapy pool", "Sensory room", "Changing Places toilet", "Step-free access"], "support": "1:2 (staff to child)", "needs": ["Cerebral palsy", "Physical disability", "Global development delay", "Sensory processing", "Communication difficulties"], "cost": "Many therapies free, some small cost", "funding": ["Charity grants available", "Fully funded"], "days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], "time": "Various — contact charity", "contactName": "Heel and Toe", "contactEmail": "info@heelandtoe.org.uk", "contactPhone": "0191 386 8606", "website": "https://heelandtoe.org.uk/contact-us/", "factChecked": true, "ownerId": "seed"},
  {"id": "th-hollybank", "category": "therapy", "name": "Hydrotherapy & Rebound Therapy — Hollybank Trust", "organisation": "Hollybank Trust (Bradbury Centre)", "type": "Therapy", "location": "Mirfield", "postcode": "", "lat": 53.6745, "lng": -1.6878, "description": "Hydrotherapy pool and rebound-therapy trampolines at the Bradbury Centre in Mirfield, West Yorkshire, for children and young people with profound and multiple disabilities and motor impairments. Website: hollybanktrust.com", "ageMin": 0, "ageMax": 19, "accessibility": ["Wheelchair accessible", "Hydrotherapy pool", "Hoist available", "Changing Places toilet", "Step-free access"], "support": "1:1 (staff to child)", "needs": ["Profound and multiple learning disability", "Cerebral palsy", "Physical disability", "Complex health needs"], "cost": "Contact for referral", "funding": ["EHCP funded", "Charity grants available"], "days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], "time": "By appointment", "contactName": "Hollybank Trust", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://hollybanktrust.com/the-bradbury-centre-hydrotherapy/", "factChecked": false, "ownerId": "seed"},
  {"id": "th-seashell", "category": "therapy", "name": "Hydrotherapy & Specialist Therapies — Seashell Trust", "organisation": "Seashell Trust", "type": "Therapy", "location": "Cheadle Hulme", "postcode": "", "lat": 53.3728, "lng": -2.1887, "description": "Hydrotherapy, rebound therapy and specialist physiotherapy for children and young people with complex, profound and multiple disabilities at the Seashell Trust centre in Cheadle Hulme, Stockport. Website: seashelltrust.org.uk", "ageMin": 0, "ageMax": 25, "accessibility": ["Wheelchair accessible", "Hydrotherapy pool", "Hoist available", "Changing Places toilet", "Step-free access", "Sensory room"], "support": "1:1 (staff to child)", "needs": ["Profound and multiple learning disability", "Physical disability", "Complex health needs", "Autism", "Communication difficulties"], "cost": "Contact / referral", "funding": ["EHCP funded", "Charity grants available"], "days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], "time": "By appointment", "contactName": "Seashell Trust", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://seashelltrust.org.uk", "factChecked": false, "ownerId": "seed"},
  {"id": "th-speechclinic-cardiff", "category": "therapy", "name": "Independent Speech & Language Therapy", "organisation": "The Speech Clinic", "type": "Therapy", "location": "Cardiff", "postcode": "", "lat": 51.4816, "lng": -3.1791, "description": "Private speech and language therapy clinic in Cardiff for babies and school-age children with communication difficulties, speech and language disorders, and dyslexia. ASLTIP member. Website: thespeechclinic.co.uk", "ageMin": 0, "ageMax": 16, "accessibility": ["Step-free access"], "support": "1:1 (therapist to child)", "needs": ["Communication difficulties", "Autism", "Hearing impairment", "Learning disability"], "cost": "Contact for pricing", "funding": ["Self-pay", "EHCP funded"], "days": ["Various"], "time": "By appointment", "contactName": "The Speech Clinic", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://thespeechclinic.co.uk", "factChecked": false, "ownerId": "seed"},
  {"id": "th-babyspeak", "category": "therapy", "name": "Speech, Language & Feeding Therapy — Baby Speak", "organisation": "Baby Speak", "type": "Therapy", "location": "London", "postcode": "W1G", "lat": 51.5178, "lng": -0.1497, "description": "Specialist private speech and language therapy on Harley Street, London, for babies and school-age children with feeding difficulties, speech and language delays, social communication and autism spectrum conditions. Website: babyspeak.co.uk", "ageMin": 0, "ageMax": 11, "accessibility": ["Wheelchair accessible", "Step-free access"], "support": "1:1 (therapist to child)", "needs": ["Communication difficulties", "Autism", "Hearing impairment", "Global development delay"], "cost": "Contact for pricing", "funding": ["Self-pay", "EHCP funded"], "days": ["Various"], "time": "By appointment", "contactName": "Baby Speak", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://babyspeak.co.uk", "factChecked": false, "ownerId": "seed"},
  {"id": "th-wlslt", "category": "therapy", "name": "Independent Speech & Language Therapy — West London", "organisation": "West London Speech and Language Therapy", "type": "Therapy", "location": "London", "postcode": "", "lat": 51.5028, "lng": -0.2275, "description": "Private speech and language therapy in Shepherd's Bush, West London for children and young people with communication needs, with specialist transition-to-adulthood support. Website: wlspeechtherapy.co.uk", "ageMin": 0, "ageMax": 25, "accessibility": ["Step-free access"], "support": "1:1 (therapist to child)", "needs": ["Communication difficulties", "Autism", "Learning disability", "ADHD"], "cost": "Contact for pricing", "funding": ["Self-pay", "EHCP funded"], "days": ["Various"], "time": "By appointment", "contactName": "West London SLT", "contactEmail": "enquiries@wlspeechtherapy.co.uk", "contactPhone": "07469 214032", "website": "https://wlspeechtherapy.co.uk", "factChecked": true, "ownerId": "seed"},
  {"id": "th-sltforkids", "category": "therapy", "name": "Speech & Language Therapy — SLT for Kids", "organisation": "SLT for Kids", "type": "Therapy", "location": "Manchester", "postcode": "", "lat": 53.4808, "lng": -2.2426, "description": "Private speech and language therapy practice in Manchester and the North West for children with speech, language and communication needs, voice difficulties and eating, drinking and swallowing challenges. Website: sltforkids.co.uk", "ageMin": 0, "ageMax": 18, "accessibility": ["Home visits available", "School visits available"], "support": "1:1 (therapist to child)", "needs": ["Communication difficulties", "Autism", "Hearing impairment", "Learning disability"], "cost": "Contact for pricing", "funding": ["Self-pay", "EHCP funded"], "days": ["Various"], "time": "By appointment", "contactName": "SLT for Kids", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://sltforkids.co.uk", "factChecked": false, "ownerId": "seed"},
  {"id": "th-movementphysio-scotland", "category": "therapy", "name": "Paediatric Neuro Physiotherapy — Scotland", "organisation": "Movement Physiotherapy", "type": "Therapy", "location": "West Lothian", "postcode": "", "lat": 55.9058, "lng": -3.5219, "description": "Private paediatric and adult neuro physiotherapy practice in West Lothian, Scotland, for children with cerebral palsy and neurological or developmental disorders. Website: movementphysiotherapy.co.uk", "ageMin": 0, "ageMax": 18, "accessibility": ["Home visits available"], "support": "1:1 (staff to child)", "needs": ["Cerebral palsy", "Physical disability", "Global development delay"], "cost": "Contact for pricing", "funding": ["Self-pay", "Insurer-funded"], "days": ["Various"], "time": "By appointment", "contactName": "Movement Physiotherapy", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://movementphysiotherapy.co.uk", "factChecked": false, "ownerId": "seed"},
  {"id": "th-percyhedley", "category": "therapy", "name": "Physio, OT, SLT & Conductive Education — Percy Hedley", "organisation": "Percy Hedley Foundation", "type": "Therapy", "location": "Newcastle", "postcode": "NE12 8YY", "lat": 55.0218, "lng": -1.568, "description": "North-East charity providing physiotherapy, occupational therapy, speech and language therapy and conductive education for children and adults with cerebral palsy, communication difficulties, autism and complex disabilities. Website: percyhedley.org.uk", "ageMin": 0, "ageMax": 99, "accessibility": ["Wheelchair accessible", "Step-free access", "Sensory room", "Changing Places toilet", "Hydrotherapy pool"], "support": "1:1 (staff to child)", "needs": ["Cerebral palsy", "Physical disability", "Autism", "Communication difficulties", "Learning disability"], "cost": "EHCP/LA-funded placements; contact for referral", "funding": ["EHCP funded", "Charity grants available"], "days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], "time": "Term time — contact for details", "contactName": "Percy Hedley Foundation", "contactEmail": "foundation@percyhedley.org.uk", "contactPhone": "0191 238 1330", "website": "https://percyhedley.org.uk/contact-us/", "factChecked": true, "ownerId": "seed"},
  {"id": "so-focus-surrey", "name": "Saturday Social Skills Club", "organisation": "Focus Surrey", "type": "Social Skills", "location": "Guildford", "postcode": "GU1", "lat": 51.2362, "lng": -0.5704, "description": "ABA-based Saturday social skills club in Guildford for children with autism, run by trained volunteers. Contact for current schedule. Website: focus-surrey.com", "ageMin": 4, "ageMax": 18, "accessibility": ["Step-free access"], "support": "Varies by need", "needs": ["Autism", "ADHD", "Sensory processing", "Learning disability"], "cost": "Contact for pricing", "funding": ["Contact provider"], "days": ["Various"], "time": "Contact for details", "contactName": "Focus Surrey", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://www.focus-surrey.com", "factChecked": false, "ownerId": "seed"},
  {"id": "so-diamond-riding", "name": "Therapeutic Riding & Vaulting", "organisation": "The Diamond Centre for Disabled Riders", "type": "Animal Therapy", "location": "Carshalton", "postcode": "SM5 4DT", "lat": 51.3674, "lng": -0.1627, "description": "Purpose-built therapeutic riding centre offering riding, carriage driving and vaulting for disabled children and adults. Tuesday–Saturday sessions. Website: diamondcentre.org.uk", "ageMin": 4, "ageMax": 99, "accessibility": ["Wheelchair accessible", "Step-free access"], "support": "Varies by need", "needs": ["Autism", "ADHD", "Learning disability", "Sensory processing", "Physical disability"], "cost": "Contact for pricing", "funding": ["Contact provider"], "days": ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], "time": "Contact for details", "contactName": "The Diamond Centre for Disabled Riders", "contactEmail": "admin@diamondcentre.org.uk", "contactPhone": "020 8643 7764", "website": "https://www.diamondcentre.org.uk", "factChecked": true, "ownerId": "seed"},
  {"id": "so-jumpin-camberley", "name": "SEN Trampoline Sessions — Jump In Camberley", "organisation": "Jump In Adventure Parks", "type": "Sports", "location": "Camberley", "postcode": "GU15", "lat": 51.3355, "lng": -0.742, "description": "Dedicated SEN trampoline sessions at the Camberley Jump In park: music off, reduced lighting and fewer participants for children with autism and sensory needs. One carer admitted free. Website: gojumpin.com", "ageMin": 4, "ageMax": 16, "accessibility": ["Low-arousal environment", "Quiet space"], "support": "Varies by need", "needs": ["Autism", "ADHD", "Sensory processing", "Learning disability"], "cost": "£12 per child — carer free", "funding": ["Self-pay"], "days": ["Various"], "time": "Contact for details", "contactName": "Jump In Adventure Parks", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://gojumpin.com/adventure-park-camberley/sessions/sen-trampoline-session/", "factChecked": false, "ownerId": "seed"},
  {"id": "so-challengers-chichester", "name": "Chichester Youthscheme — Challengers", "organisation": "Disability Challengers", "type": "Social Skills", "location": "Chichester", "postcode": "PO19 1RJ", "lat": 50.8365, "lng": -0.7792, "description": "Weekly Saturday and holiday youth activities for disabled teenagers aged 13–18 in Chichester, meeting at Westgate Leisure Centre with staff-supported outings. Website: disability-challengers.org", "ageMin": 13, "ageMax": 18, "accessibility": ["Wheelchair accessible", "Step-free access"], "support": "1:2 (staff to child)", "needs": ["Autism", "Learning disability", "Physical disability", "Global development delay"], "cost": "Contact for pricing", "funding": ["Contact provider"], "days": ["Saturday"], "time": "Contact for details", "contactName": "Disability Challengers", "contactEmail": "information@disability-challengers.org", "contactPhone": "01483 579390", "website": "https://disability-challengers.org/youth/", "factChecked": true, "ownerId": "seed"},
  {"id": "so-woking-sensory-swim", "name": "SEN Leisure Pool Sessions", "organisation": "Pool in the Park (Freedom Leisure)", "type": "Swimming", "location": "Woking", "postcode": "GU22 9BA", "lat": 51.3088, "lng": -0.5447, "description": "Quiet SEN swim sessions at Pool in the Park, Woking, with reduced numbers, music off and SEND-trained lifeguards. The pool's changing facilities were upgraded to be Changing Places-ready in a 2019–2020 refurbishment. Booking essential. Website: via Surrey Local Offer / Freedom Leisure", "ageMin": 4, "ageMax": 16, "accessibility": ["Hoist available", "Step-free access", "Changing Places toilet"], "support": "Varies by need", "needs": ["Autism", "ADHD", "Learning disability", "Sensory processing", "Physical disability"], "cost": "Low cost — contact centre", "funding": ["Contact provider"], "days": ["Monday", "Wednesday", "Thursday"], "time": "Contact for details", "contactName": "Pool in the Park", "contactEmail": "Contact via website", "contactPhone": "01483 771122", "website": "https://www.freedom-leisure.co.uk/centres/woking-pool-in-the-park/", "factChecked": false, "ownerId": "seed"},
  {"id": "so-kids-surrey", "name": "Community Inclusion Trips & Clubs", "organisation": "KIDS Surrey", "type": "Social Skills", "location": "Woking", "postcode": "GU21", "lat": 51.3168, "lng": -0.559, "description": "SEND-specialist charity running Saturday clubs, community trips and supported activities for disabled children aged 5–17 in Surrey. Autism-specialist staff. Website: kids.org.uk", "ageMin": 5, "ageMax": 17, "accessibility": ["Varies by venue"], "support": "1:2 (staff to child)", "needs": ["Autism", "Learning disability", "Physical disability", "Global development delay"], "cost": "Contact — Short Breaks funded", "funding": ["Short Breaks funded", "Charity grants available"], "days": ["Saturday"], "time": "Contact for details", "contactName": "KIDS Surrey", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://www.kids.org.uk", "factChecked": false, "ownerId": "seed"},
  {"id": "so-spelthorne-sensory", "name": "Sensory Room & Play Sessions", "organisation": "Spelthorne Family Centre", "type": "Sensory", "location": "Ashford", "postcode": "TW15 2HZ", "lat": 51.4338, "lng": -0.4622, "description": "Drop-in sensory room, messy play and social sessions for children with disabilities and additional needs run by Surrey Care Trust's Spelthorne Family Centres (Clarendon, Stanwell & Buckland). Website: via Surrey Local Offer", "ageMin": 0, "ageMax": 11, "accessibility": ["Sensory room", "Step-free access"], "support": "Varies by need", "needs": ["Autism", "ADHD", "Learning disability", "Sensory processing", "Physical disability"], "cost": "Low cost", "funding": ["Contact provider"], "days": ["Weekdays"], "time": "Contact for details", "contactName": "Spelthorne Family Centre", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://www.surreycc.gov.uk", "factChecked": false, "ownerId": "seed"},
  {"id": "so-gravesend-library", "name": "Autism-Friendly Library Hour", "organisation": "Gravesend Library", "type": "Sensory", "location": "Gravesend", "postcode": "DA12", "lat": 51.4415, "lng": 0.3706, "description": "Monthly autism-friendly Saturday morning at Gravesend Library with reduced lighting, a chill-out area and sensory resources — quieter and calmer than normal opening. Free entry. Website: kent.gov.uk", "ageMin": 0, "ageMax": 16, "accessibility": ["Quiet space", "Step-free access"], "support": "Varies by need", "needs": ["Autism", "ADHD", "Sensory processing", "Learning disability"], "cost": "Free", "funding": ["Fully funded"], "days": ["Saturday"], "time": "Saturday 10–11am monthly", "contactName": "Gravesend Library", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://www.kent.gov.uk/education-and-children/special-educational-needs", "factChecked": false, "ownerId": "seed"},
  {"id": "so-adventurekidz", "name": "SEN & Autism Soft Play Evenings", "organisation": "Adventure Kidz Indoor Play Barn", "type": "Sensory", "location": "Aylesford", "postcode": "ME20 7UB", "lat": 51.2817, "lng": 0.4779, "description": "Monthly SEN-exclusive soft-play evening at Adventure Kidz Aylesford for children with autism and additional needs: reduced noise, calmer environment. Not wheelchair accessible. Website: adventurekidz.co.uk", "ageMin": 0, "ageMax": 12, "accessibility": ["Low-arousal environment", "Sensory play area"], "support": "Varies by need", "needs": ["Autism", "ADHD", "Sensory processing", "Learning disability"], "cost": "~£5–7 per child", "funding": ["Self-pay"], "days": ["Monday"], "time": "Last Monday monthly, evening", "contactName": "Adventure Kidz Indoor Play Barn", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://adventurekidz.co.uk/special-needs/", "factChecked": false, "ownerId": "seed"},
  {"id": "so-rarebreeds", "name": "SEND-Friendly Farm Visit", "organisation": "South of England Rare Breeds Centre", "type": "Animal Therapy", "location": "Ashford", "postcode": "TN26 3RJ", "lat": 51.1465, "lng": 0.8698, "description": "Working rare-breeds farm near Ashford with accessible tractor-trailer rides, animal handling and a welcoming environment for children with disabilities and additional needs. Website: rarebreeds.org.uk", "ageMin": 0, "ageMax": 18, "accessibility": ["Wheelchair accessible", "Accessible café", "Step-free access"], "support": "Varies by need", "needs": ["Autism", "Learning disability", "Physical disability", "Global development delay"], "cost": "Contact for pricing", "funding": ["Contact provider"], "days": ["Various"], "time": "Daily seasonal", "contactName": "South of England Rare Breeds Centre", "contactEmail": "info@rarebreeds.org.uk", "contactPhone": "01233 861493", "website": "https://www.rarebreeds.org.uk", "factChecked": true, "ownerId": "seed"},
  {"id": "so-wingham-wildlife", "name": "KultureCity Sensory-Certified Wildlife Park", "organisation": "Wingham Wildlife Park", "type": "Animal Therapy", "location": "Wingham", "postcode": "CT3 1JL", "lat": 51.2738, "lng": 1.2087, "description": "KultureCity-certified sensory-inclusive wildlife park near Canterbury with a Quiet Zone, sensory bags and free wheelchair hire. Carers go free with proof of DLA/PIP. Website: winghamwildlifepark.co.uk", "ageMin": 0, "ageMax": 99, "accessibility": ["Wheelchair accessible", "Quiet space", "Sensory bags available", "Step-free access", "Free wheelchair hire"], "support": "Varies by need", "needs": ["Autism", "ADHD", "Sensory processing", "Learning disability", "Physical disability"], "cost": "~£23 adult; carer free with proof", "funding": ["Self-pay"], "days": ["Various"], "time": "Daily during opening season", "contactName": "Wingham Wildlife Park", "contactEmail": "info@winghamwildlifepark.co.uk", "contactPhone": "01227 720836", "website": "https://winghamwildlifepark.co.uk/visitor-information/access-statement/", "factChecked": true, "ownerId": "seed"},
  {"id": "so-clipclimb-tonbridge", "name": "Autism-Friendly Climbing Sessions", "organisation": "Clip 'n Climb Tonbridge", "type": "Sports", "location": "Tonbridge", "postcode": "TN9", "lat": 51.1942, "lng": 0.2762, "description": "Thursday SEN climbing sessions at Clip 'n Climb Tonbridge with music off and reduced lighting for children with autism and additional needs. Website: mykentfamily.co.uk", "ageMin": 4, "ageMax": 16, "accessibility": ["Low-arousal environment"], "support": "Varies by need", "needs": ["Autism", "ADHD", "Sensory processing", "Learning disability"], "cost": "Contact for pricing", "funding": ["Contact provider"], "days": ["Thursday"], "time": "Thursday 5:30pm", "contactName": "Clip 'n Climb Tonbridge", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://www.clipnclimb.co.uk", "factChecked": false, "ownerId": "seed"},
  {"id": "so-gravity-kent", "name": "SEN Trampoline Sessions — Gravity Kent", "organisation": "Gravity Active", "type": "Sports", "location": "Bluewater", "postcode": "DA9", "lat": 51.4396, "lng": 0.2892, "description": "Weekly SEN trampoline sessions at Gravity Bluewater and Maidstone with reduced lighting, music off and one carer free per child. Pre-booking required. Website: gravity-global.com", "ageMin": 4, "ageMax": 16, "accessibility": ["Low-arousal environment", "Quiet space"], "support": "Varies by need", "needs": ["Autism", "ADHD", "Sensory processing", "Learning disability"], "cost": "Contact for pricing — carer free", "funding": ["Self-pay"], "days": ["Weekly"], "time": "Contact for details", "contactName": "Gravity Active", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://www.gravity-global.com", "factChecked": false, "ownerId": "seed"},
  {"id": "so-kent-autistic-trust", "name": "Day Centre Activities & Sensory Sessions", "organisation": "Kent Autistic Trust", "type": "Sensory", "location": "Maidstone", "postcode": "ME15", "lat": 51.272, "lng": 0.52, "description": "Specialist autism day and resource centres across Kent offering activities, sensory sessions and life-skills support for children and adults with autism. Website: kentautistictrust.org", "ageMin": 5, "ageMax": 99, "accessibility": ["Sensory room", "Quiet space"], "support": "Varies by need", "needs": ["Autism"], "cost": "Contact for referral", "funding": ["EHCP funded", "Charity grants available"], "days": ["Various"], "time": "Contact for details", "contactName": "Kent Autistic Trust", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://www.kentautistictrust.org/day-resource-centres", "factChecked": false, "ownerId": "seed"},
  {"id": "so-bedgebury-relaxed", "name": "Relaxed After-Dark Light Trail Sessions", "organisation": "Bedgebury Pinetum", "type": "Nature", "location": "Ashford", "postcode": "TN17 2SJ", "lat": 51.1465, "lng": 0.8698, "description": "Lower-capacity relaxed sessions at Bedgebury's seasonal light trail, designed for children with autism and additional needs who find large crowds and loud music overwhelming. Website: bedgeburypinetum.org.uk", "ageMin": 0, "ageMax": 99, "accessibility": ["Wheelchair accessible", "Step-free access"], "support": "Varies by need", "needs": ["Autism", "ADHD", "Sensory processing", "Learning disability"], "cost": "Contact for ticket pricing", "funding": ["Contact provider"], "days": ["Various"], "time": "Selected evenings Nov–Dec", "contactName": "Bedgebury Pinetum", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://www.bedgeburypinetum.org.uk", "factChecked": false, "ownerId": "seed"},
  {"id": "so-qe2", "name": "Accessible Adventure Activities — QE2 Centre", "organisation": "QE2 Activity Centre", "type": "Sports", "location": "Hedge End", "postcode": "SO31 1BH", "lat": 50.9259, "lng": -1.3018, "description": "Specialist accessible adventure activities for people with additional needs including powerboating, climbing, art and holiday clubs. Staff trained in additional needs. Changing Places toilet with hoist. Website: qe2activitycentre.co.uk", "ageMin": 0, "ageMax": 99, "accessibility": ["Changing Places toilet", "Hoist available", "Wheelchair accessible", "Step-free access", "Accessible motorboat"], "support": "1:1 (staff to child)", "needs": ["Autism", "Learning disability", "Physical disability", "Global development delay"], "cost": "~£60/day", "funding": ["Contact provider"], "days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], "time": "9:30am–3:30pm", "contactName": "QE2 Activity Centre", "contactEmail": "office@qe2activitycentre.co.uk", "contactPhone": "023 8040 4844", "website": "https://qe2activitycentre.co.uk/", "factChecked": true, "ownerId": "seed"},
  {"id": "so-marwell-zoo", "name": "Accessible & Sensory-Friendly Zoo Visit", "organisation": "Marwell Wildlife", "type": "Animal Therapy", "location": "Colden Common", "postcode": "SO21 1JH", "lat": 51.0368, "lng": -1.2875, "description": "Hampshire's flagship zoo with UK-first Changing Places toilet, a sensory trail with mp3 guide, free wheelchair hire and Sunflower lanyard scheme. Carers go free with proof of disability. Website: marwell.org.uk", "ageMin": 0, "ageMax": 99, "accessibility": ["Changing Places toilet", "Sensory room", "Wheelchair accessible", "Step-free access", "Sensory trail", "Free wheelchair hire"], "support": "Varies by need", "needs": ["Autism", "ADHD", "Learning disability", "Sensory processing", "Physical disability"], "cost": "Varies; carer free with proof", "funding": ["Contact provider"], "days": ["Daily"], "time": "From 10am daily", "contactName": "Marwell Wildlife", "contactEmail": "marwell@marwell.org.uk", "contactPhone": "01962 777407", "website": "https://www.marwell.org.uk/plan-your-visit/guests-with-accessibility-needs/", "factChecked": true, "ownerId": "seed"},
  {"id": "so-finkley-farm", "name": "SEND Early Entry Farm Days", "organisation": "Finkley Down Farm", "type": "Animal Therapy", "location": "Andover", "postcode": "SP11 6NF", "lat": 51.211, "lng": -1.4978, "description": "SEND-specific early entry days at Finkley Down Farm near Andover — gates open early for families with special needs before the general public, reducing sensory overload. Booking essential. Website: finkleydownfarm.co.uk", "ageMin": 0, "ageMax": 16, "accessibility": ["Wheelchair accessible", "Early access — reduced crowds"], "support": "Varies by need", "needs": ["Autism", "ADHD", "Learning disability", "Sensory processing", "Physical disability"], "cost": "Special SEND ticket pricing", "funding": ["Contact provider"], "days": ["Various"], "time": "9am — selected school holiday dates", "contactName": "Finkley Down Farm", "contactEmail": "Contact via website", "contactPhone": "01264 324141", "website": "https://www.finkleydownfarm.co.uk", "factChecked": true, "ownerId": "seed"},
  {"id": "so-winchester-science", "name": "Autism-Friendly Shows & Relaxed Visits", "organisation": "Winchester Science Centre & Planetarium", "type": "Sensory", "location": "Winchester", "postcode": "SO21 1HZ", "lat": 51.0577, "lng": -1.3082, "description": "Monthly autism-friendly planetarium shows and relaxed visits with a dedicated Recombobulation Room, sensory backpacks and Changing Places toilet. Booking required. Website: winchestersciencecentre.org", "ageMin": 0, "ageMax": 18, "accessibility": ["Changing Places toilet", "Sensory room", "Quiet space", "Step-free access", "Sensory backpacks"], "support": "Varies by need", "needs": ["Autism", "ADHD", "Sensory processing", "Learning disability"], "cost": "Admission + £2 autism-friendly show", "funding": ["Self-pay"], "days": ["Various"], "time": "Check website for current dates", "contactName": "Winchester Science Centre & Planetarium", "contactEmail": "access@winchestersciencecentre.org", "contactPhone": "01962 863791", "website": "https://www.winchestersciencecentre.org/visiting/accessibility", "factChecked": true, "ownerId": "seed"},
  {"id": "so-maryrose", "name": "Relaxed Opening Mornings", "organisation": "The Mary Rose Museum", "type": "Sensory", "location": "Portsmouth", "postcode": "PO1 3LJ", "lat": 50.8198, "lng": -1.088, "description": "Monthly relaxed opening mornings at the Mary Rose Museum in Portsmouth (Historic Dockyard) with a visual story, dedicated breakout space and ear defenders for visitors with autism and additional needs. Website: maryrose.org", "ageMin": 0, "ageMax": 99, "accessibility": ["Wheelchair accessible", "Quiet space", "Ear defenders available", "Step-free access"], "support": "Varies by need", "needs": ["Autism", "ADHD", "Sensory processing", "Learning disability"], "cost": "Included with museum admission", "funding": ["Self-pay"], "days": ["Various"], "time": "10am–12pm monthly", "contactName": "The Mary Rose Museum", "contactEmail": "education@maryrose.org", "contactPhone": "Contact via website", "website": "https://maryrose.org/events/relaxed-opening-morning/", "factChecked": false, "ownerId": "seed"},
  {"id": "so-pavilion-sensory", "name": "Sensory 4 All & Adaptive Cycling", "organisation": "Pavilion on the Park", "type": "Sensory", "location": "Basingstoke", "postcode": "RG21", "lat": 51.2665, "lng": -1.0872, "description": "Multi-sensory sessions, adapted cycling (Cycles 4 All) and inclusive activities for children and adults with disabilities at the Pavilion on the Park, Basingstoke. Website: paviliononthepark.org", "ageMin": 0, "ageMax": 99, "accessibility": ["Wheelchair accessible", "Sensory room", "Step-free access"], "support": "Varies by need", "needs": ["Autism", "ADHD", "Learning disability", "Sensory processing", "Physical disability"], "cost": "~£5/session", "funding": ["Contact provider"], "days": ["Various"], "time": "Contact for details", "contactName": "Pavilion on the Park", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://paviliononthepark.org/activities-clubs/cycles4all/", "factChecked": false, "ownerId": "seed"},
  {"id": "so-collective-dance", "name": "Sensory Dance Classes", "organisation": "Collective Motion Dance", "type": "Dance", "location": "Basingstoke", "postcode": "RG21", "lat": 51.2665, "lng": -1.0872, "description": "Inclusive sensory dance classes for children aged 3+ with SEND in Basingstoke, using props, movement exploration and music in a calm, supportive environment. Website: collectivemotiondance.com", "ageMin": 3, "ageMax": 16, "accessibility": ["Step-free access"], "support": "Varies by need", "needs": ["Autism", "ADHD", "Learning disability", "Sensory processing", "Physical disability"], "cost": "£6.60/class", "funding": ["Self-pay"], "days": ["Thursday"], "time": "Thursdays 5pm", "contactName": "Collective Motion Dance", "contactEmail": "louisa@collectivemotiondance.com", "contactPhone": "07725 334418", "website": "https://www.collectivemotiondance.com", "factChecked": false, "ownerId": "seed"},
  {"id": "so-paultons", "name": "Queue Assist & Accessible Visits", "organisation": "Paultons Park (Peppa Pig World)", "type": "Sports", "location": "Romsey", "postcode": "SO51 6AL", "lat": 50.9897, "lng": -1.4978, "description": "Family theme park offering a pre-bookable Queue Assist Pass, quieter garden areas, an accessible changing facility and flat tarmac paths throughout. Wheelchair/mobility-scooter users are admitted free, but there is no separate carer discount. Website: paultons.co.uk", "ageMin": 0, "ageMax": 12, "accessibility": ["Wheelchair accessible", "Quiet space", "Queue assist pass", "Step-free access"], "support": "Varies by need", "needs": ["Autism", "ADHD", "Sensory processing", "Learning disability", "Physical disability"], "cost": "Standard admission; free for wheelchair/scooter users", "funding": ["Self-pay"], "days": ["Daily"], "time": "During park opening hours", "contactName": "Paultons Park (Peppa Pig World)", "contactEmail": "enquiries@paultons.co.uk", "contactPhone": "023 8081 4442", "website": "https://www.paultons.co.uk/visitor-information/accessibility", "factChecked": false, "ownerId": "seed"},
  {"id": "so-armyflying", "name": "Noise Off Mornings — Army Flying Museum", "organisation": "Army Flying Museum", "type": "Sensory", "location": "Andover", "postcode": "SO20 8FB", "lat": 51.1502, "lng": -1.5726, "description": "Monthly Noise Off Mornings (9am–12:30pm) at the Army Flying Museum, Middle Wallop: sound effects are switched off or reduced for visitors with sensory processing issues to explore in a quieter environment. Wide buggy/wheelchair-friendly walkways and lift access to upper floors. Website: armyflying.com", "ageMin": 0, "ageMax": 99, "accessibility": ["Wheelchair accessible", "Low-arousal environment", "Step-free access"], "support": "Varies by need", "needs": ["Autism", "ADHD", "Sensory processing", "Learning disability"], "cost": "Contact for admission pricing", "funding": ["Self-pay"], "days": ["Monday"], "time": "Monthly, 9am–12:30pm — see website for date", "contactName": "Army Flying Museum", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://armyflying.com/what-s-on/events/noise-off-morning/", "factChecked": false, "ownerId": "seed"},
  {"id": "so-mayflower-relaxed", "name": "Relaxed & Chilled Performances", "organisation": "Mayflower Theatre", "type": "Drama", "location": "Southampton", "postcode": "SO15 1GE", "lat": 50.9097, "lng": -1.4044, "description": "Southampton's flagship theatre running relaxed and chilled performances with adjusted lighting and sound, chill-out areas and a Sunflower lanyard scheme. Carers admitted free on the companion scheme. Accessible entrance leads to a Changing Places toilet. Website: mayflower.org.uk", "ageMin": 0, "ageMax": 99, "accessibility": ["Wheelchair accessible", "Quiet space", "Relaxed performances", "Step-free access", "Changing Places toilet"], "support": "Varies by need", "needs": ["Autism", "ADHD", "Sensory processing", "Learning disability"], "cost": "Tickets vary; carer free (companion scheme)", "funding": ["Contact provider"], "days": ["Various"], "time": "Selected performances — check website", "contactName": "Mayflower Theatre", "contactEmail": "access@mayflower.org.uk", "contactPhone": "02380 711813", "website": "https://mayflower.org.uk/your-visit/accessibility/accessible-performances", "factChecked": true, "ownerId": "seed"},
  {"id": "so-dorset-dcf", "name": "Accessible For All — Wheelchair Dance, Watersports & More", "organisation": "The Dorset Children's Foundation", "type": "Sports", "location": "Bournemouth", "postcode": "BH1", "lat": 50.7209, "lng": -1.8803, "description": "Charity providing accessible activities for disabled children across Dorset including wheelchair dancing, Wetwheels sailing, adapted football, swimming and sensory art. Website: thedcf.org", "ageMin": 0, "ageMax": 18, "accessibility": ["Wheelchair accessible", "Varies by activity"], "support": "Varies by need", "needs": ["Autism", "Learning disability", "Physical disability", "Global development delay"], "cost": "Low cost / free", "funding": ["Charity grants available", "Fully funded"], "days": ["Various"], "time": "Contact for details", "contactName": "The Dorset Children's Foundation", "contactEmail": "Patsy@thedcf.org", "contactPhone": "Contact via website", "website": "https://thedcf.org/accessible-for-all/", "factChecked": false, "ownerId": "seed"},
  {"id": "so-dorset-shortbreaks", "name": "Short Breaks: Farm Club, Sports & Stargazing", "organisation": "Dorset Council", "type": "Social Skills", "location": "Bournemouth", "postcode": "BH", "lat": 50.7209, "lng": -1.8803, "description": "Targeted short break activities for disabled children in Dorset including a farm club, sports sessions, arts and stargazing. Targeted breaks require no formal assessment. Website: dorsetcouncil.gov.uk", "ageMin": 0, "ageMax": 18, "accessibility": ["Varies by venue"], "support": "Varies by need", "needs": ["Autism", "Learning disability", "Physical disability", "Global development delay"], "cost": "Funded / subsidised", "funding": ["Short Breaks funded"], "days": ["Various"], "time": "Contact for details", "contactName": "Dorset Council", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://www.dorsetcouncil.gov.uk/w/targeted-short-breaks", "factChecked": false, "ownerId": "seed"},
  {"id": "so-sportsable-boccia", "name": "Boccia Club", "organisation": "SportsAble", "type": "Sports", "location": "Maidenhead", "postcode": "SL6", "lat": 51.522, "lng": -0.7231, "description": "Weekly boccia club in Maidenhead for people with physical and learning disabilities — fully assisted ramps and all equipment provided. Open to all abilities. Website: sportsable.co.uk", "ageMin": 5, "ageMax": 99, "accessibility": ["Wheelchair accessible", "Step-free access"], "support": "Varies by need", "needs": ["Physical disability", "Learning disability", "Cerebral palsy"], "cost": "Membership fee", "funding": ["Contact provider"], "days": ["Wednesday"], "time": "Wednesdays 11:30am", "contactName": "SportsAble", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://www.sportsable.co.uk/news/sports-activities/boccia-club-berkshire/", "factChecked": true, "ownerId": "seed"},
  {"id": "so-sportsable-wba", "name": "Wheelchair Basketball", "organisation": "SportsAble", "type": "Sports", "location": "Maidenhead", "postcode": "SL6", "lat": 51.522, "lng": -0.7231, "description": "Competitive and recreational wheelchair basketball for juniors and adults in Maidenhead, with sports wheelchairs provided by SportsAble for beginners. Website: sportsable.co.uk", "ageMin": 8, "ageMax": 99, "accessibility": ["Wheelchair accessible", "Sports wheelchairs provided"], "support": "Varies by need", "needs": ["Physical disability", "Spina bifida", "Cerebral palsy"], "cost": "Membership fee", "funding": ["Contact provider"], "days": ["Thursday"], "time": "Thursdays 8pm", "contactName": "SportsAble", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://www.sportsable.co.uk/news/sports-activities/wheelchair-basketball/", "factChecked": true, "ownerId": "seed"},
  {"id": "so-tvkings-wba", "name": "Junior & Adult Wheelchair Basketball", "organisation": "Thames Valley Kings", "type": "Sports", "location": "Thatcham", "postcode": "RG19 4LJ", "lat": 51.4025, "lng": -1.2563, "description": "Wheelchair basketball club for juniors (8+) and adults, training at Kennet Leisure Centre, Thatcham, with additional sessions for advanced players at FBC Centre, Wokingham. Specialist sports wheelchairs provided — you don't need to be a wheelchair user to join. Website: berkshirewheelchairbasketball.co.uk", "ageMin": 8, "ageMax": 99, "accessibility": ["Wheelchair accessible", "Sports wheelchairs provided"], "support": "Varies by need", "needs": ["Physical disability", "Spina bifida", "Cerebral palsy"], "cost": "Free first session, then ~£5/session", "funding": ["Contact provider"], "days": ["Saturday"], "time": "12:00 – 14:00 (beginners) — additional weekday sessions for advanced players, contact club", "contactName": "Thames Valley Kings", "contactEmail": "info@berkshirewheelchairbasketball.co.uk", "contactPhone": "07775 682987", "website": "http://www.berkshirewheelchairbasketball.co.uk/", "factChecked": true, "ownerId": "seed"},
  {"id": "so-tvap", "name": "Thames Valley Adventure Playground", "organisation": "Thames Valley Adventure Playground", "type": "Sensory", "location": "Taplow", "postcode": "SL6 0PR", "lat": 51.516, "lng": -0.6819, "description": "Fully accessible adventure playground and respite centre for disabled children 0–16 in Taplow, Berkshire, with Changing Places facilities, electric hoist, sensory rooms and outdoor splash pad. Siblings go free. Website: tvap.co.uk", "ageMin": 0, "ageMax": 16, "accessibility": ["Changing Places toilet", "Hoist available", "Sensory room", "Wheelchair accessible", "Step-free access", "Splash pad"], "support": "1:2 (staff to child)", "needs": ["Autism", "Learning disability", "Physical disability", "Global development delay"], "cost": "£11/session (suggested donation)", "funding": ["Short Breaks funded", "Charity grants available"], "days": ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], "time": "Contact for details", "contactName": "Thames Valley Adventure Playground", "contactEmail": "theplayground@tvap.co.uk", "contactPhone": "01628 628599", "website": "https://www.tvap.co.uk", "factChecked": true, "ownerId": "seed"},
  {"id": "so-lambourn-rda", "name": "RDA Horse Riding — Lambourn", "organisation": "Lambourn RDA", "type": "Animal Therapy", "location": "Chilton Foliat", "postcode": "RG17 0TJ", "lat": 51.4268, "lng": -1.538, "description": "Riding for the Disabled Association group based at Manor Farm Stables, Chilton Foliat, near Lambourn, Berkshire — offering riding and non-riding therapy sessions for children and adults with physical and learning disabilities. Run entirely by volunteers, five sessions a week: Monday afternoon, Tuesday morning, Wednesday afternoon, Thursday morning, and Saturday mornings by arrangement. New riders complete an application form. Website: lambournrda.co.uk", "ageMin": 4, "ageMax": 99, "accessibility": ["Wheelchair accessible", "Step-free access"], "support": "Varies by need", "needs": ["Physical disability", "Learning disability", "Autism", "Sensory processing"], "cost": "Contact for session fees", "funding": ["Contact provider"], "days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Saturday"], "time": "Mon PM · Tue AM · Wed PM · Thu AM · Sat AM (by arrangement)", "contactName": "Lambourn RDA", "contactEmail": "info@lambournrda.co.uk", "contactPhone": "07798 941229", "website": "https://lambournrda.co.uk", "factChecked": true, "ownerId": "seed"},
  {"id": "so-swings-smiles", "name": "Swings & Smiles Special-Needs Play", "organisation": "Swings & Smiles", "type": "Sensory", "location": "Thatcham", "postcode": "RG18", "lat": 51.4009, "lng": -1.2594, "description": "Charity providing inclusive play sessions, respite and sibling support for children with special needs and their families at its centre in Thatcham, Berkshire — sensory room with UV dark room and ball pool, ceiling and mobile hoists, and an accessible personal care room. Open Fridays, weekends and school holidays; registration required (children must have a diagnosis or be on a diagnosis pathway). Website: swingsandsmiles.co.uk", "ageMin": 0, "ageMax": 18, "accessibility": ["Sensory room", "Hoist available", "Changing Places toilet", "Step-free access"], "support": "Varies by need", "needs": ["Autism", "Learning disability", "Physical disability", "Global development delay"], "cost": "£2.50–£4/session", "funding": ["Contact provider"], "days": ["Friday", "Saturday", "Sunday"], "time": "Check website for current timetable", "contactName": "Swings & Smiles", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://fisd.oxfordshire.gov.uk/kb5/oxfordshire/directory/service.page?id=SiZ4445aq1E", "factChecked": false, "ownerId": "seed"},
  {"id": "so-jumpin-slough", "name": "SEN Trampoline Sessions — Jump In Slough", "organisation": "Jump In Adventure Parks", "type": "Sports", "location": "Slough", "postcode": "SL1", "lat": 51.5105, "lng": -0.595, "description": "Dedicated SEN trampoline sessions at the Jump In Slough park: music off, reduced lighting and fewer participants. One carer admitted free per child. Website: gojumpin.com", "ageMin": 4, "ageMax": 16, "accessibility": ["Low-arousal environment", "Quiet space"], "support": "Varies by need", "needs": ["Autism", "ADHD", "Sensory processing", "Learning disability"], "cost": "£12 per child — carer free", "funding": ["Self-pay"], "days": ["Various"], "time": "Contact for details", "contactName": "Jump In Adventure Parks", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://gojumpin.com/trampoline-park-slough/sessions/sen-trampoline-session/", "factChecked": false, "ownerId": "seed"},
  {"id": "so-dreamcatchers", "name": "Forest School for Additional Needs", "organisation": "Dreamcatchers Forest School", "type": "Nature", "location": "Oxford", "postcode": "OX29", "lat": 51.752, "lng": -1.2577, "description": "Children in Need-funded forest school sessions for children aged 5–15 with learning disabilities, autism and social, emotional and mental health needs in West Oxfordshire. Website: livewell.oxfordshire.gov.uk", "ageMin": 5, "ageMax": 15, "accessibility": ["Outdoor sensory environment"], "support": "High staff ratio", "needs": ["Autism", "ADHD", "Sensory processing", "Learning disability", "Learning disability"], "cost": "Funded (Children in Need)", "funding": ["Charity grants available"], "days": ["School holidays"], "time": "Contact for details", "contactName": "Dreamcatchers Forest School", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://livewell.oxfordshire.gov.uk/Services/5366", "factChecked": false, "ownerId": "seed"},
  {"id": "so-oasis-oxford", "name": "Exclusive Autism Family Fun Days", "organisation": "OASIS (Oxfordshire Autistic Society)", "type": "Sports", "location": "Oxford", "postcode": "OX", "lat": 51.752, "lng": -1.2577, "description": "OASIS Oxfordshire runs exclusive-hire family fun days for autistic children including swimming, trampolining and sensory play. One carer goes free per child with a registration discount card. Website: oasisonline.org.uk", "ageMin": 0, "ageMax": 18, "accessibility": ["Varies by venue"], "support": "Varies by need", "needs": ["Autism", "Global development delay", "Sensory processing"], "cost": "~£5–10/child; carer free", "funding": ["Contact provider"], "days": ["School holidays"], "time": "Contact for details", "contactName": "OASIS (Oxfordshire Autistic Society)", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://oasisonline.org.uk/", "factChecked": false, "ownerId": "seed"},
  {"id": "so-oxnat-hist", "name": "Autism-Friendly Science Saturdays", "organisation": "Oxford University Museum of Natural History", "type": "Sensory", "location": "Oxford", "postcode": "OX1 3PW", "lat": 51.752, "lng": -1.2577, "description": "Autism-friendly Saturdays at the Oxford Natural History Museum with quieter sessions, specimen-handling and a welcoming environment for neurodiverse families. Free entry. Website: oumnh.ox.ac.uk", "ageMin": 0, "ageMax": 14, "accessibility": ["Wheelchair accessible", "Step-free access", "Quiet space"], "support": "Varies by need", "needs": ["Autism", "ADHD", "Sensory processing", "Learning disability"], "cost": "Free", "funding": ["Fully funded"], "days": ["Saturday"], "time": "Selected Saturdays", "contactName": "Oxford University Museum of Natural History", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://www.oumnh.ox.ac.uk", "factChecked": false, "ownerId": "seed"},
  {"id": "so-oxford-playhouse", "name": "Relaxed Performances", "organisation": "Oxford Playhouse", "type": "Drama", "location": "Oxford", "postcode": "OX1 2LG", "lat": 51.752, "lng": -1.2577, "description": "The Oxford Playhouse runs relaxed performances with adjusted lighting and sound, chill-out areas and freedom to move around the auditorium for children with autism and sensory needs. Website: oxfordplayhouse.com", "ageMin": 0, "ageMax": 99, "accessibility": ["Wheelchair accessible", "Quiet space", "Relaxed performances", "Step-free access"], "support": "Varies by need", "needs": ["Autism", "ADHD", "Sensory processing", "Learning disability", "Learning disability"], "cost": "Standard tickets; companion discount", "funding": ["Contact provider"], "days": ["Various"], "time": "Selected performances — check website", "contactName": "Oxford Playhouse", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://www.oxfordplayhouse.com", "factChecked": false, "ownerId": "seed"},
  {"id": "so-southbucks-rda", "name": "Therapeutic Horse Riding", "organisation": "South Bucks RDA", "type": "Animal Therapy", "location": "Fulmer", "postcode": "SL2 4QR", "lat": 51.5519, "lng": -0.5836, "description": "Riding for the Disabled Association group in Fulmer, Buckinghamshire, offering therapeutic riding sessions for children and adults with physical, sensory and learning disabilities. Website: southbucksrda.org", "ageMin": 4, "ageMax": 99, "accessibility": ["Wheelchair accessible", "Accessible parking", "Indoor arena"], "support": "Varies by need", "needs": ["Physical disability", "Autism", "Learning disability", "Sensory processing"], "cost": "Contact for session fees", "funding": ["Contact provider"], "days": ["Various"], "time": "Contact for details", "contactName": "South Bucks RDA", "contactEmail": "enquiries@southbucksrda.org", "contactPhone": "01753 662796", "website": "https://southbucksrda.org", "factChecked": true, "ownerId": "seed"},
  {"id": "so-gosling-inclusive", "name": "Inclusive Tennis, Trampolining & SEN Sessions", "organisation": "Gosling Sports Park", "type": "Sports", "location": "Welwyn Garden City", "postcode": "AL8 6XE", "lat": 51.8077, "lng": -0.2029, "description": "Inclusive disability sport sessions at Gosling Sports Park in Welwyn Garden City, including relaxed sensory trampoline, tennis and swimming for children and adults with SEND. Website: gosling.everyoneactive.com", "ageMin": 4, "ageMax": 99, "accessibility": ["Wheelchair accessible", "Changing Places toilet", "Step-free access"], "support": "Varies by need", "needs": ["Autism", "ADHD", "Learning disability", "Sensory processing", "Physical disability"], "cost": "Contact for pricing", "funding": ["Contact provider"], "days": ["Various"], "time": "Contact for details", "contactName": "Gosling Sports Park", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://gosling.everyoneactive.com", "factChecked": false, "ownerId": "seed"},
  {"id": "so-westminster-climbing", "name": "Inclusive Climbing Wall Sessions", "organisation": "Westminster Lodge Leisure", "type": "Sports", "location": "St Albans", "postcode": "AL3 4SD", "lat": 51.7516, "lng": -0.336, "description": "Inclusive climbing wall sessions at Westminster Lodge in St Albans, open to all disabilities with trained staff. Thursday morning sessions with accessible toilets and Blue Badge parking. Website: everyoneactive.com", "ageMin": 5, "ageMax": 99, "accessibility": ["Wheelchair accessible", "Accessible toilets", "Blue Badge parking"], "support": "Varies by need", "needs": ["Autism", "ADHD", "Learning disability", "Sensory processing", "Physical disability"], "cost": "Contact for pricing", "funding": ["Contact provider"], "days": ["Thursday"], "time": "Thursday 9:30am", "contactName": "Westminster Lodge Leisure", "contactEmail": "fibirabe@everyoneactive.com", "contactPhone": "Contact via website", "website": "https://www.everyoneactive.com/centre/westminster-lodge-leisure-centre/", "factChecked": false, "ownerId": "seed"},
  {"id": "so-tring-nhm", "name": "SENDsational Mornings — Natural History Museum Tring", "organisation": "Natural History Museum at Tring", "type": "Nature", "location": "Tring", "postcode": "HP23 6AP", "lat": 51.7921, "lng": -0.6627, "description": "Monthly pre-opening SENDsational Morning at the Natural History Museum at Tring for children under 13 with autism and SEND — before general visitors arrive for a calm, quiet experience. Free. Website: nhm.ac.uk/tring", "ageMin": 0, "ageMax": 13, "accessibility": ["Wheelchair accessible", "Quiet space", "Step-free access"], "support": "Varies by need", "needs": ["Autism", "ADHD", "Sensory processing", "Learning disability"], "cost": "Free", "funding": ["Fully funded"], "days": ["Various"], "time": "Monthly pre-opening — check website", "contactName": "Natural History Museum at Tring", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://www.nhm.ac.uk/visit/tring.html", "factChecked": false, "ownerId": "seed"},
  {"id": "so-djs-jungle", "name": "SEN Quiet Soft Play Sessions", "organisation": "DJ's Play Jungle", "type": "Sensory", "location": "St Albans", "postcode": "AL1", "lat": 51.7516, "lng": -0.336, "description": "SEN-friendly soft play sessions at DJ's Play Jungle in St Albans with music off and a relaxed, lower-stimulation environment for children with autism and sensory needs. Website: via Hertfordshire DSPL7", "ageMin": 0, "ageMax": 12, "accessibility": ["Sensory play area", "Low-arousal environment"], "support": "Varies by need", "needs": ["Autism", "ADHD", "Sensory processing", "Learning disability"], "cost": "Contact for pricing", "funding": ["Contact provider"], "days": ["Weekly"], "time": "Contact for details", "contactName": "DJ's Play Jungle", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://www.dspl7.org.uk", "factChecked": false, "ownerId": "seed"},
  {"id": "so-airhop-chelmsford", "name": "SEN Trampoline Sessions — AirHop Chelmsford", "organisation": "AirHop Chelmsford", "type": "Sports", "location": "Chelmsford", "postcode": "CM2 6UA", "lat": 51.7356, "lng": 0.4685, "description": "Dedicated SEN trampoline sessions at the AirHop adventure park in Chelmsford for children with additional needs: reduced capacity, adjustable lighting. Carers go free; grip socks required. Website: airhop.co.uk", "ageMin": 4, "ageMax": 16, "accessibility": ["Wheelchair accessible", "Lift access", "Low-arousal environment"], "support": "Varies by need", "needs": ["Autism", "ADHD", "Learning disability", "Sensory processing", "Physical disability"], "cost": "Grip socks ~£2.90; carer free", "funding": ["Self-pay"], "days": ["Scheduled"], "time": "See website for current SEN session times", "contactName": "AirHop Chelmsford", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://www.airhop.co.uk/chelmsford-activity-centre/trampoline-park/support-sen/", "factChecked": false, "ownerId": "seed"},
  {"id": "so-autism-anglia-cc", "name": "Community Connect Autism Drop-In & Groups", "organisation": "Autism Anglia", "type": "Social Skills", "location": "Colchester", "postcode": "CO4 9YQ", "lat": 51.8959, "lng": 0.8919, "description": "Free autism and ADHD support, drop-in sessions and community activities for children and young people up to 25 in Colchester and across Essex via the Community Connect programme. Website: autism-anglia.org.uk", "ageMin": 0, "ageMax": 25, "accessibility": ["Step-free access"], "support": "Varies by need", "needs": ["Autism", "ADHD"], "cost": "Free", "funding": ["Fully funded"], "days": ["Various"], "time": "Contact for details", "contactName": "Autism Anglia", "contactEmail": "Contact via website", "contactPhone": "01206 577678", "website": "https://www.autism-anglia.org.uk", "factChecked": true, "ownerId": "seed"},
  {"id": "so-audley-end-railway", "name": "Sensory-Friendly Miniature Railway Events", "organisation": "Audley End Miniature Railway", "type": "Nature", "location": "Saffron Walden", "postcode": "CB11 4JB", "lat": 52.0218, "lng": 0.2417, "description": "Miniature steam railway set in woodland near Saffron Walden, Essex, with relaxed and sensory-friendly family events in the grounds. Website: audleyendminrailway.co.uk", "ageMin": 0, "ageMax": 14, "accessibility": ["Varied terrain accessible", "Outdoor grounds"], "support": "Varies by need", "needs": ["Autism", "ADHD", "Sensory processing", "Learning disability"], "cost": "Contact for event pricing", "funding": ["Contact provider"], "days": ["Various"], "time": "Seasonal events — check website", "contactName": "Audley End Miniature Railway", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://www.audleyendminrailway.co.uk", "factChecked": false, "ownerId": "seed"},
  {"id": "so-romseymill-aspire", "name": "Youth Clubs for Autistic Young People — Aspire", "organisation": "Romsey Mill", "type": "Social Skills", "location": "Cambridge", "postcode": "CB1 2EU", "lat": 52.2053, "lng": 0.1218, "description": "Term-time youth clubs for autistic young people in mainstream schools (Year 5 upwards) run by Romsey Mill in Cambridge — social skills, cooking, arts and outdoor activities. Website: romseymill.org", "ageMin": 9, "ageMax": 18, "accessibility": ["Step-free access"], "support": "Varies by need", "needs": ["Autism"], "cost": "Contact — funded placements", "funding": ["Contact provider"], "days": ["Term time"], "time": "Contact for details", "contactName": "Romsey Mill", "contactEmail": "Contact via website", "contactPhone": "01223 213162", "website": "https://www.romseymill.org/aspire", "factChecked": true, "ownerId": "seed"},
  {"id": "so-spectrum-cambridge", "name": "Sensory Play Sessions & Events", "organisation": "Spectrum", "type": "Sensory", "location": "Cambridge", "postcode": "CB", "lat": 52.2053, "lng": 0.1218, "description": "Sensory-friendly play sessions, events and activities for autistic children and families at the Spectrum centre in Cambridge, with a sensory corner and bubble area. Also a local Max Card distributor. Website: spectrum.org.uk", "ageMin": 0, "ageMax": 12, "accessibility": ["Sensory room", "Quiet space"], "support": "Varies by need", "needs": ["Autism", "Learning disability", "Sensory processing"], "cost": "Varies by event", "funding": ["Charity grants available"], "days": ["Regular"], "time": "Contact for details", "contactName": "Spectrum", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://spectrum.org.uk/", "factChecked": false, "ownerId": "seed"},
  {"id": "so-cadmus", "name": "Disability MultiSport — CADMuS", "organisation": "CADMuS / Cambridge City Council", "type": "Sports", "location": "Cambridge", "postcode": "CB1", "lat": 52.2053, "lng": 0.1218, "description": "Saturday morning disability multi-sport sessions in Cambridge including boccia, table tennis, goalball and Kung Fu, led by qualified instructors. All abilities welcome. Website: cambridge.gov.uk", "ageMin": 8, "ageMax": 99, "accessibility": ["Wheelchair accessible", "Step-free access"], "support": "Varies by need", "needs": ["Physical disability", "Learning disability", "Visual impairment"], "cost": "Contact for pricing", "funding": ["Contact provider"], "days": ["Saturday"], "time": "Saturdays 10am–12pm", "contactName": "CADMuS / Cambridge City Council", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://www.cambridge.gov.uk/inclusive-physical-activities", "factChecked": false, "ownerId": "seed"},
  {"id": "so-arts-pioneers", "name": "Arts Saturdays at Fitzwilliam Museum", "organisation": "Arts Pioneers / Cambridgeshire", "type": "Arts & Crafts", "location": "Cambridge", "postcode": "CB2 1RB", "lat": 52.2053, "lng": 0.1218, "description": "Monthly Saturday arts club at the Fitzwilliam Museum, Cambridge, funded via Cambridgeshire Short Breaks for disabled young people aged 11–15. Creative sessions using world-class museum collections. Website: cambridgeshire.gov.uk", "ageMin": 11, "ageMax": 15, "accessibility": ["Wheelchair accessible", "Step-free access"], "support": "Varies by need", "needs": ["Autism", "Learning disability", "Physical disability", "Global development delay"], "cost": "Short Breaks funded", "funding": ["Short Breaks funded"], "days": ["Saturday"], "time": "Monthly Saturday", "contactName": "Arts Pioneers / Cambridgeshire", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://www.cambridgeshire.gov.uk/council/childrens-commissioning/commissioned-services-strategies-and-resources", "factChecked": false, "ownerId": "seed"},
  {"id": "so-little-miracles-cambs", "name": "Disability Play & Youth Groups", "organisation": "Little Miracles", "type": "Social Skills", "location": "Ely", "postcode": "CB6", "lat": 52.3985, "lng": 0.263, "description": "Drop-in centres and youth clubs in Cambridgeshire (Ely, Peterborough, Fenland) for children with additional needs and life-limiting conditions. Free and welcoming. Website: littlemiraclescharity.org.uk", "ageMin": 0, "ageMax": 18, "accessibility": ["Varies by venue"], "support": "Varies by need", "needs": ["Complex health needs", "Learning disability", "Physical disability", "Autism"], "cost": "Free", "funding": ["Fully funded"], "days": ["Regular"], "time": "Contact for details", "contactName": "Little Miracles", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://www.littlemiraclescharity.org.uk", "factChecked": false, "ownerId": "seed"},
  {"id": "so-southdowns-rda", "name": "RDA Riding — South Downs Group", "organisation": "South Downs RDA", "type": "Animal Therapy", "location": "Albourne", "postcode": "BN6 9DE", "lat": 50.9333, "lng": -0.2009, "description": "Riding for the Disabled Association group in Albourne, West Sussex, offering weekly therapeutic riding sessions for children and adults with autism, physical and learning disabilities. Website: southdownsrda.org", "ageMin": 4, "ageMax": 99, "accessibility": ["Wheelchair accessible", "Indoor arena", "Outdoor school"], "support": "Varies by need", "needs": ["Physical disability", "Autism", "Learning disability", "Sensory processing"], "cost": "Contact for session fees", "funding": ["Contact provider"], "days": ["Wednesday"], "time": "Wednesday mornings", "contactName": "South Downs RDA", "contactEmail": "Contact via website", "contactPhone": "01403 711867", "website": "https://www.southdownsrda.org", "factChecked": true, "ownerId": "seed"},
  {"id": "so-nature-nurture-sussex", "name": "SEND Forest School — Dragonflies", "organisation": "Nature Nurture Sussex", "type": "Nature", "location": "East Grinstead", "postcode": "RH19", "lat": 51.1248, "lng": -0.0065, "description": "Forest school sessions in East Sussex for neurodivergent children and teenagers with autism, PDA, ADHD and anxiety — building confidence, sensory exploration and independence in a woodland setting. Website: naturenurturesussex.com", "ageMin": 5, "ageMax": 17, "accessibility": ["Outdoor sensory environment"], "support": "Small group", "needs": ["Autism", "ADHD", "Anxiety", "Sensory processing"], "cost": "Grant-funded — contact for details", "funding": ["Contact provider"], "days": ["Regular"], "time": "Contact for details", "contactName": "Nature Nurture Sussex", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://www.naturenurturesussex.com/dragonfliesandteen", "factChecked": false, "ownerId": "seed"},
  {"id": "so-activ8-brighton", "name": "SEND Holiday Clubs — Brighton & West Sussex", "organisation": "Activ8 for Kids", "type": "Social Skills", "location": "Brighton", "postcode": "BN1", "lat": 50.8225, "lng": -0.1372, "description": "SEND holiday clubs in Brighton and West Sussex for disabled children, with sensory rooms, quiet areas and sibling-inclusive sessions during school holidays. Free for eligible HAF families. Website: activ8forkids.co.uk", "ageMin": 5, "ageMax": 16, "accessibility": ["Sensory room", "Quiet space"], "support": "Varies by need", "needs": ["Autism", "Learning disability", "Physical disability", "Global development delay"], "cost": "HAF free for eligible; self-pay otherwise", "funding": ["Short Breaks funded", "Self-pay"], "days": ["School holidays"], "time": "Contact for details", "contactName": "Activ8 for Kids", "contactEmail": "Debbie@activ8forkids.co.uk", "contactPhone": "Contact via website", "website": "https://www.activ8forkids.co.uk/special-educational-needs-disabilities-in-west-sussex-and-brighton/", "factChecked": false, "ownerId": "seed"},
  {"id": "so-drusillas", "name": "Family Zoo for Young Children", "organisation": "Drusillas Park", "type": "Animal Therapy", "location": "Alfriston", "postcode": "BN26 5QS", "lat": 50.8024, "lng": 0.1681, "description": "Small zoo and adventure play park in East Sussex popular with families of autistic children — less overwhelming than large theme parks with accessible paths and quiet areas. Website: drusillas.co.uk", "ageMin": 0, "ageMax": 12, "accessibility": ["Wheelchair accessible", "Quiet space", "Step-free access"], "support": "Varies by need", "needs": ["Autism", "ADHD", "Sensory processing", "Learning disability"], "cost": "Contact for ticket pricing", "funding": ["Self-pay"], "days": ["Daily"], "time": "Daily during opening season", "contactName": "Drusillas Park", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://www.drusillas.co.uk", "factChecked": false, "ownerId": "seed"},
  {"id": "so-cft-relaxed", "name": "Relaxed Performances & SEN Sessions", "organisation": "Chichester Festival Theatre", "type": "Drama", "location": "Chichester", "postcode": "PO19 1JE", "lat": 50.8365, "lng": -0.7792, "description": "Relaxed and chilled performances at Chichester Festival Theatre with adjusted lighting and sound, chill-out space and trained staff. Companion scheme gives carers a free ticket. Website: cft.org.uk", "ageMin": 0, "ageMax": 99, "accessibility": ["Wheelchair accessible", "Quiet space", "Step-free access"], "support": "Varies by need", "needs": ["Autism", "ADHD", "Sensory processing", "Learning disability"], "cost": "Tickets vary; carer free (companion scheme)", "funding": ["Contact provider"], "days": ["Various"], "time": "Selected performances — see website", "contactName": "Chichester Festival Theatre", "contactEmail": "access@cft.org.uk", "contactPhone": "01243 781312", "website": "https://www.cft.org.uk/accessibility/relaxed-and-dementia-friendly-performances", "factChecked": true, "ownerId": "seed"},
  {"id": "so-amaze-sussex", "name": "Family Activities & Autism Support — Amaze Sussex", "organisation": "Amaze Sussex", "type": "Social Skills", "location": "Brighton", "postcode": "BN1", "lat": 50.8225, "lng": -0.1372, "description": "Brighton-based charity for families of children with SEND running parent/carer groups, family activities and an information service across East Sussex. Website: amazesussex.org.uk", "ageMin": 0, "ageMax": 25, "accessibility": ["Varies by venue"], "support": "Varies by need", "needs": ["Autism", "ADHD", "Sensory processing", "Learning disability", "Learning disability"], "cost": "Free", "funding": ["Fully funded"], "days": ["Regular"], "time": "Contact for details", "contactName": "Amaze Sussex", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://amazesussex.org.uk/conditions-concerns/autism/", "factChecked": false, "ownerId": "seed"},
  {"id": "so-wiltshire-inclusive", "name": "Inclusive Wiltshire — Community Activity Clubs", "organisation": "Wiltshire Council / Wiltshire Together", "type": "Social Skills", "location": "Trowbridge", "postcode": "BA14", "lat": 51.3204, "lng": -2.2083, "description": "Wiltshire's SEND short-breaks programme (now called Inclusive Wiltshire), offering community activity clubs, supported outings and social events for disabled children 0–25 across the county. Website: wiltshire.gov.uk", "ageMin": 0, "ageMax": 25, "accessibility": ["Varies by venue"], "support": "Varies by need", "needs": ["Autism", "Learning disability", "Physical disability", "Global development delay"], "cost": "Funded / small co-pay", "funding": ["Short Breaks funded"], "days": ["Various"], "time": "Contact for details", "contactName": "Wiltshire Council / Wiltshire Together", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://www.wiltshire.gov.uk/news/inclusive-wiltshire-launching-soon-for-children-and-young-people-with-send", "factChecked": false, "ownerId": "seed"},
  {"id": "so-bewilderwood", "name": "Woodland Adventure Park — Relaxed & Accessible", "organisation": "BeWILDerwood", "type": "Nature", "location": "Hoveton", "postcode": "NR12 8JW", "lat": 52.7066, "lng": 1.4654, "description": "Accessible woodland adventure park near Hoveton, Norfolk, with fast-track entry for wheelchair users (admitted free), accessible paths and a welcoming approach for families with disabilities. Carers free with DLA/PIP/Blue Badge or Access Card. Website: bewilderwood.co.uk", "ageMin": 0, "ageMax": 12, "accessibility": ["Wheelchair accessible", "Step-free access", "Accessible paths"], "support": "Varies by need", "needs": ["Autism", "ADHD", "Learning disability", "Sensory processing", "Physical disability"], "cost": "~£20–£23; carer free with proof", "funding": ["Self-pay"], "days": ["Seasonal"], "time": "Check opening season on website", "contactName": "BeWILDerwood", "contactEmail": "Contact via website", "contactPhone": "01692 633033", "website": "https://bewilderwood.co.uk/plan-your-visit/accessibility", "factChecked": true, "ownerId": "seed"},
  {"id": "so-roarr-norfolk", "name": "Accessible Dinosaur Adventure Park", "organisation": "ROARR! Dinosaur Adventure", "type": "Nature", "location": "Lenwade", "postcode": "NR9 5JE", "lat": 52.7107, "lng": 1.0804, "description": "Accessible adventure park near Norwich with a Changing Places toilet, a quiet sensory room, free loaner wheelchairs and ear defenders for visitors with autism and additional needs. Website: roarr.co.uk", "ageMin": 0, "ageMax": 12, "accessibility": ["Changing Places toilet", "Sensory room", "Wheelchair accessible", "Step-free access", "Ear defenders available"], "support": "Varies by need", "needs": ["Autism", "ADHD", "Learning disability", "Sensory processing", "Physical disability"], "cost": "Varies; carer concession", "funding": ["Self-pay"], "days": ["Seasonal"], "time": "Check opening dates", "contactName": "ROARR! Dinosaur Adventure", "contactEmail": "Contact via website", "contactPhone": "01603 876310", "website": "https://www.roarr.co.uk", "factChecked": true, "ownerId": "seed"},
  {"id": "so-banham-zoo", "name": "Makaton Trail & Sensory Provision — Banham Zoo", "organisation": "Banham Zoo", "type": "Animal Therapy", "location": "Banham", "postcode": "NR16 2HE", "lat": 52.456, "lng": 1.036, "description": "Norfolk zoo offering a Makaton Zoo Trail, hearing loops, ear defenders and quiet areas, with free carer entry for disabled visitors with proof. Website: banhamzoo.co.uk", "ageMin": 0, "ageMax": 99, "accessibility": ["Wheelchair accessible", "Hearing loops", "Ear defenders available", "Quiet space", "Step-free access"], "support": "Varies by need", "needs": ["Autism", "Communication difficulties", "Hearing impairment", "Learning disability"], "cost": "Varies; carer free with proof", "funding": ["Self-pay"], "days": ["Daily"], "time": "During opening hours", "contactName": "Banham Zoo", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://www.banhamzoo.co.uk", "factChecked": false, "ownerId": "seed"},
  {"id": "so-norfolk-opportunities", "name": "Life Skills & Sensory Sessions — NAS Norfolk", "organisation": "Autism Anglia (Norfolk Opportunities Centre)", "type": "Sensory", "location": "Norwich", "postcode": "NR1", "lat": 52.6309, "lng": 1.2974, "description": "Autism Anglia's Norfolk centre offering life skills sessions, sensory activities and supported community access for young people with autism in Norfolk. Website: autism-anglia.org.uk", "ageMin": 10, "ageMax": 25, "accessibility": ["Sensory room", "Quiet space"], "support": "Varies by need", "needs": ["Autism"], "cost": "Contact for referral", "funding": ["EHCP funded", "Charity grants available"], "days": ["Various"], "time": "Contact for details", "contactName": "Autism Anglia (Norfolk Opportunities Centre)", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://www.autism-anglia.org.uk", "factChecked": false, "ownerId": "seed"},
  {"id": "so-kids-hayward", "name": "Hayward Adventure Playground & Holiday Schemes", "organisation": "KIDS", "type": "Sports", "location": "Islington", "postcode": "N7 9PL", "lat": 51.5384, "lng": -0.0999, "description": "Fully accessible adventure playground in Islington for disabled children aged 6–25, with holiday clubs, after-school activities, sensory rooms, nest swings and soft play. Siblings welcome. Free for Islington-referred children. Website: kids.org.uk", "ageMin": 6, "ageMax": 25, "accessibility": ["Wheelchair accessible", "Sensory room", "Hoist available", "Step-free access"], "support": "1:2 (staff to child)", "needs": ["Autism", "Learning disability", "Physical disability", "Global development delay"], "cost": "Free (Islington-referred)", "funding": ["Fully funded"], "days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], "time": "Contact for details", "contactName": "KIDS", "contactEmail": "Contact via website", "contactPhone": "020 7607 0033", "website": "https://www.kids.org.uk/services/hayward-adventure-playground/", "factChecked": true, "ownerId": "seed"},
  {"id": "so-kids-chelsea", "name": "Chelsea Adventure Playground", "organisation": "KIDS", "type": "Sports", "location": "Chelsea", "postcode": "SW3 4SR", "lat": 51.4875, "lng": -0.1687, "description": "Specialist accessible adventure playground in Chelsea for disabled children with zip wires, soft play, sensory rooms and therapy dogs. After-school and holiday schemes. Website: kids.org.uk", "ageMin": 6, "ageMax": 24, "accessibility": ["Wheelchair accessible", "Sensory room", "Hoist available", "Step-free access"], "support": "1:2 (staff to child)", "needs": ["Autism", "Learning disability", "Physical disability", "Global development delay"], "cost": "Free (referral-based)", "funding": ["Fully funded"], "days": ["Various"], "time": "Contact for details", "contactName": "KIDS", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://www.kids.org.uk/services/", "factChecked": false, "ownerId": "seed"},
  {"id": "so-wac-arts", "name": "Wac Nites Inclusive Arts Programme", "organisation": "Wac Arts", "type": "Arts & Crafts", "location": "Camden", "postcode": "NW3 4QP", "lat": 51.543, "lng": -0.153, "description": "Inclusive performing arts programme for young people aged 9–30 with mild-to-moderate learning disabilities in North London — dance, music, drama and art in a supportive, non-judgemental environment. Website: wacarts.co.uk", "ageMin": 9, "ageMax": 30, "accessibility": ["Wheelchair accessible", "Disabled parking nearby"], "support": "Varies by need", "needs": ["Learning disability", "Autism"], "cost": "Subsidised rate", "funding": ["Contact provider"], "days": ["Weekends", "Evenings", "School holidays"], "time": "Contact for details", "contactName": "Wac Arts", "contactEmail": "Contact via website", "contactPhone": "020 7692 5800", "website": "https://www.wacarts.co.uk", "factChecked": true, "ownerId": "seed"},
  {"id": "so-mencap-london-gateway", "name": "Mencap Gateway Social Club — Balham", "organisation": "Mencap Gateway", "type": "Social Skills", "location": "Balham", "postcode": "SW12 8DR", "lat": 51.443, "lng": -0.1526, "description": "Monday evening social club in Balham for adults with learning disabilities — one of Mencap's London Gateway Clubs offering friendship, activities and supported community involvement. Website: mencap.org.uk", "ageMin": 18, "ageMax": 99, "accessibility": ["Step-free access"], "support": "Varies by need", "needs": ["Learning disability", "Autism"], "cost": "Free members nights", "funding": ["Charity grants available"], "days": ["Monday"], "time": "Monday evenings term-time", "contactName": "Mencap Gateway", "contactEmail": "Contact via website", "contactPhone": "0207 696 6960", "website": "https://yournetwork.mencap.org.uk", "factChecked": true, "ownerId": "seed"},
  {"id": "so-sutton-mencap", "name": "After-School, Saturday & Holiday Clubs — Sutton", "organisation": "Sutton Mencap", "type": "Social Skills", "location": "Wallington", "postcode": "SM6", "lat": 51.362, "lng": -0.1542, "description": "After-school, Saturday and holiday activity clubs for children with learning disabilities and autism in the London Borough of Sutton, run by Sutton Mencap. Website: suttonmencap.co.uk", "ageMin": 5, "ageMax": 25, "accessibility": ["Varies by venue"], "support": "Varies by need", "needs": ["Learning disability", "Autism"], "cost": "Contact for pricing", "funding": ["Contact provider"], "days": ["Various"], "time": "Contact for details", "contactName": "Sutton Mencap", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://www.suttonmencap.co.uk", "factChecked": false, "ownerId": "seed"},
  {"id": "so-nhm-dawnosaurs", "name": "Dawnosaurs — Relaxed Early Visit", "organisation": "Natural History Museum", "type": "Sensory", "location": "London", "postcode": "SW7 5BD", "lat": 51.5072, "lng": -0.1276, "description": "Pre-opening relaxed visits to the Natural History Museum for neurodivergent children aged 5–15, with neurodivergent-aware facilitators, low sensory stimulation and limited visitor numbers. Free. Website: nhm.ac.uk", "ageMin": 5, "ageMax": 15, "accessibility": ["Wheelchair accessible", "Quiet space", "Step-free access"], "support": "Varies by need", "needs": ["Autism", "ADHD", "Sensory processing", "Learning disability"], "cost": "Free", "funding": ["Fully funded"], "days": ["Various"], "time": "Selected mornings 8–10am", "contactName": "Natural History Museum", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://www.nhm.ac.uk", "factChecked": false, "ownerId": "seed"},
  {"id": "so-sciencemuseum-earlybirds", "name": "Early Birds Sensory-Friendly Opening", "organisation": "Science Museum", "type": "Sensory", "location": "London", "postcode": "SW7 2DD", "lat": 51.5072, "lng": -0.1276, "description": "Sensory-friendly early opening sessions at the Science Museum for children with autism and sensory needs — lowered volume, exclusive access and calmer environment. Free. Website: sciencemuseum.org.uk", "ageMin": 0, "ageMax": 18, "accessibility": ["Wheelchair accessible", "Quiet space", "Step-free access"], "support": "Varies by need", "needs": ["Autism", "ADHD", "Sensory processing", "Learning disability"], "cost": "Free", "funding": ["Fully funded"], "days": ["Various"], "time": "Selected early mornings", "contactName": "Science Museum", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://www.sciencemuseum.org.uk", "factChecked": false, "ownerId": "seed"},
  {"id": "so-zsl-relaxed", "name": "Relaxed Opening Sessions — ZSL London Zoo", "organisation": "ZSL London Zoo", "type": "Animal Therapy", "location": "Regent's Park", "postcode": "NW1 4RY", "lat": 51.5313, "lng": -0.157, "description": "Relaxed, calm opening sessions at ZSL London Zoo for children and families with autism and neurodiversity — fewer visitors, lower stimulation and a more predictable, safe environment. Website: zsl.org", "ageMin": 0, "ageMax": 18, "accessibility": ["Wheelchair accessible", "Quiet space", "Step-free access"], "support": "Varies by need", "needs": ["Autism", "ADHD", "Sensory processing", "Learning disability"], "cost": "Varies — check current pricing", "funding": ["Contact provider"], "days": ["Various"], "time": "Selected early dates", "contactName": "ZSL London Zoo", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://www.zsl.org/zsl-london-zoo/visitor-information/accessibility", "factChecked": false, "ownerId": "seed"},
  {"id": "so-parklanestables-rda", "name": "Therapeutic Horse Riding — Park Lane Stables", "organisation": "Park Lane Stables RDA", "type": "Animal Therapy", "location": "Teddington", "postcode": "TW11 0HY", "lat": 51.4237, "lng": -0.3283, "description": "RDA therapeutic riding at Park Lane Stables in Teddington, Surrey/London. Drop-off available for mobility needs; hardship fund for those who cannot afford sessions. Website: parklanestables.co.uk", "ageMin": 4, "ageMax": 99, "accessibility": ["Wheelchair accessible", "Accessible parking"], "support": "Varies by need", "needs": ["Physical disability", "Autism", "Learning disability", "Mental health"], "cost": "Contact — hardship fund available", "funding": ["Contact provider"], "days": ["Various"], "time": "Contact for details", "contactName": "Park Lane Stables RDA", "contactEmail": "theteam@parklanestables.co.uk", "contactPhone": "07796 842328", "website": "https://www.parklanestables.co.uk", "factChecked": true, "ownerId": "seed"},
  {"id": "so-lion-king-relaxed", "name": "Relaxed Performance — The Lion King", "organisation": "Disney Theatrical (Lyceum Theatre)", "type": "Drama", "location": "London", "postcode": "WC2E 7RQ", "lat": 51.5072, "lng": -0.1276, "description": "Annual relaxed performance of Disney's The Lion King at the Lyceum Theatre in London's West End — reduced sound effects, adjusted lighting, quiet rooms and specially trained front-of-house staff. Website: thelionking.co.uk", "ageMin": 4, "ageMax": 99, "accessibility": ["Wheelchair accessible", "Quiet space", "Step-free access", "Relaxed performances"], "support": "Varies by need", "needs": ["Autism", "ADHD", "Sensory processing", "Learning disability", "Learning disability"], "cost": "Standard West End ticket; companion concession", "funding": ["Self-pay"], "days": ["Annual"], "time": "One relaxed performance per year — check website", "contactName": "Disney Theatrical (Lyceum Theatre)", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://autismeye.com/announcement/disney-relaxed-performances/", "factChecked": false, "ownerId": "seed"},
  {"id": "so-atg-relaxed", "name": "Relaxed Performances at ATG Theatres", "organisation": "ATG Theatres", "type": "Drama", "location": "Nationwide UK", "postcode": "", "lat": 52.5, "lng": -1.5, "description": "Ambassador Theatre Group venues (Shaftesbury, Savoy, Churchill Bromley, various South England) offer regular relaxed performances with chill-out areas, visual stories and adjusted sound and lighting for autistic and neurodivergent audiences. Website: atgtickets.com", "ageMin": 0, "ageMax": 99, "accessibility": ["Wheelchair accessible", "Quiet space", "Relaxed performances"], "support": "Varies by need", "needs": ["Autism", "ADHD", "Sensory processing", "Learning disability"], "cost": "Standard ticket; companion free", "funding": ["Contact provider"], "days": ["Various"], "time": "Selected performances — see venue listings", "contactName": "ATG Theatres", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://www.atgtickets.com/accessibility", "factChecked": false, "ownerId": "seed"},
  {"id": "so-rda-southeast", "name": "RDA South East — Riding for All Abilities", "organisation": "RDA South East Region", "type": "Animal Therapy", "location": "Nationwide UK", "postcode": "", "lat": 52.5, "lng": -1.5, "description": "Regional Riding for the Disabled Association body covering 80+ groups across Surrey, Sussex and Kent offering therapeutic riding and carriage driving for disabled children and adults. Website: rda-southeastregion.org.uk", "ageMin": 4, "ageMax": 99, "accessibility": ["Varies by group"], "support": "Varies by need", "needs": ["Physical disability", "Autism", "Learning disability", "Sensory processing"], "cost": "Contact local group", "funding": ["Contact provider"], "days": ["Weekly"], "time": "Weekly sessions — contact local group", "contactName": "RDA South East Region", "contactEmail": "Contact via website", "contactPhone": "Contact via website", "website": "https://www.rda-southeastregion.org.uk/", "factChecked": false, "ownerId": "seed"},
  {"id": "so-greenwich-mencap", "name": "Activities, Day Centre & Crafts — Greenwich Mencap", "organisation": "Greenwich Mencap", "type": "Social Skills", "location": "London", "postcode": "SE18", "lat": 51.5072, "lng": -0.1276, "description": "Day activities, crafts and the Riverwood Project for adults with learning disabilities in Woolwich/Greenwich — building independence, friendships and skills. Website: greenwichmencap.org.uk", "ageMin": 18, "ageMax": 99, "accessibility": ["Wheelchair accessible", "Step-free access"], "support": "Varies by need", "needs": ["Learning disability"], "cost": "Contact for pricing", "funding": ["Contact provider"], "days": ["Weekdays"], "time": "Contact for details", "contactName": "Greenwich Mencap", "contactEmail": "Contact via website", "contactPhone": "020 8305 2245", "website": "https://www.greenwichmencap.org.uk/our-services/activities/", "factChecked": true, "ownerId": "seed"},

  // === NEW ACTIVITIES (research batch 2) ===
  {id:"act-001",name:"Disability Gymnastics",organisation:"Valleys Gymnastics Academy",category:"activity",type:"Gymnastics",location:"Crumlin, Caerphilly",postcode:"NP11",lat:51.7,lng:-3.1,description:"Insport Gold accredited disability gymnastics for children with SEND. SEN and sibling drop-in sessions with qualified coaches and a full competitive pathway.",ageMin:4,ageMax:18,cost:"From £4.50 per session",contactPhone:"01495 248070",website:"https://www.valleysgymnasticsacademy.co.uk",needs:["Learning Disabilities","Physical Disabilities","Autism"],access:["Wheelchair accessible","1:1 support"],days:["Sunday","Wednesday"],factChecked:false,ownerId:"seed"},
  {id:"act-002",name:"Inclusion Gymnastics",organisation:"Richmond Gymnastics Association",category:"activity",type:"Gymnastics",location:"Richmond, London",postcode:"TW9",lat:51.461,lng:-0.305,description:"Inclusion gymnastics for Reception through to Year 11 with qualified inclusion coaches and 1:1 support. Entry via trial session.",ageMin:4,ageMax:18,cost:"£197 per term",contactEmail:"rga@richmondgymnastics.co.uk",website:"https://richmondgymnastics.co.uk",needs:["Autism","Down Syndrome","Physical Disabilities"],access:["1:1 support"],days:["Saturday"],factChecked:false,ownerId:"seed"},
  {id:"act-003",name:"SEN Gymnastics Club",organisation:"Leeds Gymnastics Club",category:"activity",type:"Gymnastics",location:"Leeds",postcode:"LS15",lat:53.8,lng:-1.5,description:"Drop-in gymnastics at John Smeaton Leisure Centre for children with additional needs and siblings in a welcoming, adapted environment.",ageMin:3,ageMax:16,cost:"Contact for pricing",website:"https://www.leedsgymclub.co.uk",needs:["Autism","Learning Disabilities","Sensory Processing"],access:["Sensory-friendly"],days:["Sunday"],factChecked:false,ownerId:"seed"},
  {id:"act-004",name:"Pan-Disability Football",organisation:"Evesham United FC",category:"activity",type:"Football",location:"Evesham",postcode:"WR11",lat:52.09,lng:-1.95,description:"Pan-disability football sessions and school holiday activity days for children with additional needs.",ageMin:4,ageMax:16,cost:"Contact for pricing",contactEmail:"eufcdisability@gmail.com",website:"https://eveshamunitedfc.com",needs:["Autism","Learning Disabilities","Physical Disabilities"],access:["1:1 support"],days:["Saturday"],factChecked:false,ownerId:"seed"},
  {id:"act-005",name:"Disability Swimming Club",organisation:"Wandsworth Amateur Swimming Association",category:"activity",type:"Swimming",location:"Wandsworth, London",postcode:"SW11",lat:51.462,lng:-0.168,description:"Inclusive swimming lessons for disabled children aged 5–12 to develop technique and progress to competition.",ageMin:5,ageMax:12,cost:"Contact for pricing",website:"https://fis.wandsworth.gov.uk",needs:["Physical Disabilities","Sensory Processing","Learning Disabilities"],access:["Wheelchair accessible"],days:["Saturday"],factChecked:false,ownerId:"seed"},
  {id:"act-006",name:"Dolphins Swim Club",organisation:"Dolphin Swim Club",category:"activity",type:"Swimming",location:"Putney, London",postcode:"SW15",lat:51.461,lng:-0.215,description:"Group swimming sessions for children with SEND at Latchmere and Putney leisure centres with in-house competitions.",ageMin:5,ageMax:18,cost:"Contact for pricing",website:"https://dolphinswimclub.org.uk",needs:["Communication Difficulties","Learning Disabilities","Physical Disabilities"],access:["Wheelchair accessible"],days:["Friday","Sunday"],factChecked:false,ownerId:"seed"},
  {id:"act-007",name:"Aqua Sensory Swimming",organisation:"Scarborough Disabled Swimming Group",category:"activity",type:"Swimming",location:"Scarborough",postcode:"YO11",lat:54.28,lng:-0.4,description:"Aqua sensory sessions and adapted Learn to Swim awards for children with SEND in a calm, supportive environment.",ageMin:0,ageMax:18,cost:"Contact for pricing",website:"https://www.sdsg.org.uk",needs:["Sensory Processing","Physical Disabilities","Multiple Disabilities"],access:["Wheelchair accessible","Sensory-friendly"],days:["Saturday"],factChecked:false,ownerId:"seed"},
  {id:"act-008",name:"Adapted Swimming Sessions",organisation:"Keynsham Seals",category:"activity",type:"Swimming",location:"Keynsham, Bath",postcode:"BS31",lat:51.42,lng:-2.5,description:"Private-hire pool sessions with two hoists for swimmers of most disabilities and their carers.",ageMin:4,ageMax:18,cost:"Contact for pricing",website:"https://keynshamseals.org.uk",needs:["Physical Disabilities","Multiple Disabilities","Learning Disabilities"],access:["Wheelchair accessible"],days:["Sunday"],factChecked:false,ownerId:"seed"},
  {id:"act-009",name:"Upbeats Down Syndrome Football",organisation:"Charlton Athletic Community Trust",category:"activity",type:"Football",location:"Charlton, London",postcode:"SE7",lat:51.487,lng:0.034,description:"Football programme specifically for children and adults with Down's syndrome; plays in the Kent Adult Disability League.",ageMin:5,ageMax:18,cost:"Contact for pricing",website:"https://cact.org.uk",needs:["Down Syndrome","Learning Disabilities"],access:["1:1 support"],days:["Saturday"],factChecked:false,ownerId:"seed"},
  {id:"act-010",name:"Pan-Disability Football",organisation:"Alive Kings Lynn Community Football",category:"activity",type:"Football",location:"King's Lynn",postcode:"PE30",lat:52.75,lng:0.4,description:"Pan-disability football and multisport for children and adults at Lynnsport Leisure Park.",ageMin:5,ageMax:18,cost:"Contact for pricing",contactEmail:"disability@norfolkfa.com",website:"https://www.norfolkfa.com/players/disability",needs:["Learning Disabilities","Physical Disabilities","Autism"],access:["1:1 support"],days:["Saturday","Thursday"],factChecked:false,ownerId:"seed"},
  {id:"act-011",name:"Down Syndrome Soccer Skills",organisation:"Community Sports Foundation (Norwich City)",category:"activity",type:"Football",location:"Norwich",postcode:"NR1",lat:52.63,lng:1.3,description:"Weekly football skills sessions for participants with Down's syndrome with festival and fixture opportunities.",ageMin:7,ageMax:18,cost:"£1 per session",website:"https://www.csfnorwich.co.uk",needs:["Down Syndrome","Learning Disabilities"],access:["1:1 support"],days:["Weekly"],factChecked:false,ownerId:"seed"},
  {id:"act-012",name:"Make A Scene SEND Theatre",organisation:"Make A Scene",category:"activity",type:"Drama",location:"Croydon",postcode:"CR0",lat:51.374,lng:-0.098,description:"Inclusive drama classes and multi-sensory theatre for children with SEND across London and the South East.",ageMin:5,ageMax:18,cost:"First session free",contactEmail:"Makeascene99@gmail.com",website:"https://www.makeascene.org.uk",needs:["Learning Disabilities","Autism","Multiple Disabilities"],access:["Sensory-friendly","1:1 support"],days:["Weekly"],factChecked:false,ownerId:"seed"},
  {id:"act-013",name:"SEN Drama Group",organisation:"Travelling Light Theatre Company",category:"activity",type:"Drama",location:"Bristol",postcode:"BS5",lat:51.456,lng:-2.561,description:"Weekly drama, music and storytelling group for disabled young people in a supported and creative environment.",ageMin:7,ageMax:15,cost:"Contact for pricing",contactEmail:"louise@travellinglighttheatre.org.uk",website:"https://www.travellinglighttheatre.org.uk",needs:["Learning Disabilities","Communication Difficulties","Autism"],access:["1:1 support"],days:["Weekly"],factChecked:false,ownerId:"seed"},
  {id:"act-014",name:"Inclusive Youth Theatre",organisation:"Angel Shed Theatre",category:"activity",type:"Drama",location:"Islington, London",postcode:"N1",lat:51.538,lng:-0.102,description:"Inclusive youth and children's theatre for young people of all abilities and backgrounds.",ageMin:5,ageMax:18,cost:"Contact for pricing",website:"https://www.angelsheddrama.co.uk",needs:["Learning Disabilities","Autism","Communication Difficulties"],access:["Sensory-friendly"],days:["Weekly"],factChecked:false,ownerId:"seed"},
  {id:"act-015",name:"Sensory Theatre Shows",organisation:"Head2Head Sensory Theatre",category:"activity",type:"Drama",location:"South East England",postcode:"SM4",lat:51.382,lng:-0.193,description:"Multi-sensory shows, pantomimes and immersive experiences for the special-needs community; Makaton-trained cast.",ageMin:3,ageMax:18,cost:"Contact for pricing",website:"https://h2hsensorytheatre.com",needs:["Multiple Disabilities","Sensory Processing","Learning Disabilities"],access:["Sensory-friendly","Wheelchair accessible"],days:["Various"],factChecked:false,ownerId:"seed"},
  {id:"act-016",name:"Interactive Sensory Theatre",organisation:"Bamboozle Theatre",category:"activity",type:"Drama",location:"Leicester",postcode:"LE2",lat:52.62,lng:-1.13,description:"Interactive multi-sensory theatre for children and young people with learning disabilities and profound needs.",ageMin:3,ageMax:18,cost:"Contact for pricing",website:"https://www.bamboozletheatre.co.uk",needs:["Multiple Disabilities","Learning Disabilities","Sensory Processing"],access:["Sensory-friendly","Wheelchair accessible"],days:["Various"],factChecked:false,ownerId:"seed"},
  {id:"act-017",name:"Sensory Shows for Complex Needs",organisation:"Oily Cart",category:"activity",type:"Drama",location:"London (national tours)",postcode:"SW17",lat:51.428,lng:-0.17,description:"Interactive, sensory theatre productions for children and young people with complex needs and autism.",ageMin:0,ageMax:18,cost:"Contact for pricing",website:"https://oilycart.org.uk",needs:["Multiple Disabilities","Autism","Sensory Processing"],access:["Sensory-friendly","Wheelchair accessible"],days:["Various"],factChecked:false,ownerId:"seed"},
  {id:"act-018",name:"Inclusive Drama Groups",organisation:"Face Front Inclusive Theatre",category:"activity",type:"Drama",location:"Edmonton, London",postcode:"N9",lat:51.628,lng:-0.062,description:"Inclusive theatre and drama groups for disabled participants with sensory and mobility impairments.",ageMin:8,ageMax:25,cost:"Contact for pricing",contactEmail:"hello@facefront.org",website:"https://www.facefront.org",needs:["Physical Disabilities","Learning Disabilities","Sensory Processing"],access:["Wheelchair accessible"],days:["Weekly"],factChecked:false,ownerId:"seed"},
  {id:"act-019",name:"Inclusive Youth Drama",organisation:"Manchester Theatre Academy",category:"activity",type:"Drama",location:"Droylsden, Manchester",postcode:"M43",lat:53.483,lng:-2.136,description:"Inclusive drama groups building confidence and skills for young people of all abilities.",ageMin:5,ageMax:18,cost:"Contact for pricing",website:"https://manchestertheatreacademy.co.uk",needs:["Learning Disabilities","Autism","Anxiety"],access:["Sensory-friendly"],days:["Tuesday"],factChecked:false,ownerId:"seed"},
  {id:"act-020",name:"Inclusive Dance Sessions",organisation:"icandance",category:"activity",type:"Dance",location:"Finchley, London",postcode:"N12",lat:51.614,lng:-0.176,description:"Dance Movement Psychotherapy-informed dance for disabled children and young people aged 4–25.",ageMin:4,ageMax:25,cost:"Contact for pricing",contactEmail:"info@icandance.org.uk",contactPhone:"07488 287102",website:"https://www.icandance.org.uk",needs:["Physical Disabilities","Learning Disabilities","Autism"],access:["Wheelchair accessible","1:1 support"],days:["Thursday","Saturday"],factChecked:false,ownerId:"seed"},
  {id:"act-021",name:"Dance for Learning Disabilities",organisation:"Magpie Dance",category:"activity",type:"Dance",location:"Bromley, London",postcode:"BR1",lat:51.406,lng:0.014,description:"UK's leading dance charity for people with learning disabilities; inclusive children's sessions run by professional dance artists.",ageMin:5,ageMax:18,cost:"Contact for pricing",website:"https://www.magpiedance.org.uk",needs:["Learning Disabilities","Down Syndrome","Autism"],access:["Wheelchair accessible"],days:["Weekly"],factChecked:false,ownerId:"seed"},
  {id:"act-022",name:"Inclusive Dance Classes",organisation:"Indepen-dance",category:"activity",type:"Dance",location:"Glasgow",postcode:"G51",lat:55.856,lng:-4.278,description:"Award-winning inclusive dance company with community classes for disabled children, youths and families.",ageMin:5,ageMax:18,cost:"Contact for pricing",website:"https://indepen-dance.org.uk",needs:["Physical Disabilities","Learning Disabilities","Multiple Disabilities"],access:["Wheelchair accessible"],days:["Weekly"],factChecked:false,ownerId:"seed"},
  {id:"act-023",name:"Inclusive Dance Programme",organisation:"Rubicon Dance",category:"activity",type:"Dance",location:"Cardiff",postcode:"CF24",lat:51.487,lng:-3.176,description:"Inclusive dance classes for ages 7–11 plus a youth dance programme across Cardiff and Newport.",ageMin:7,ageMax:18,cost:"Contact for pricing",website:"https://rubicondance.co.uk",needs:["Learning Disabilities","Physical Disabilities","Autism"],access:["Wheelchair accessible"],days:["Weekly"],factChecked:false,ownerId:"seed"},
  {id:"act-024",name:"Dance for All Abilities",organisation:"DanceSyndrome",category:"activity",type:"Dance",location:"Chorley, Lancashire",postcode:"PR7",lat:53.655,lng:-2.625,description:"Inclusive dance led by people with learning disabilities; all ages and abilities welcome to join the company.",ageMin:8,ageMax:18,cost:"Contact for pricing",website:"https://www.dancesyndrome.co.uk",needs:["Learning Disabilities","Down Syndrome"],access:["Wheelchair accessible"],days:["Weekly"],factChecked:false,ownerId:"seed"},
  {id:"act-025",name:"Visually Impaired Dance",organisation:"Touchdown Dance",category:"activity",type:"Dance",location:"Manchester",postcode:"M4",lat:53.481,lng:-2.237,description:"Dance workshops and performances for visually impaired and sighted people of all ages and abilities.",ageMin:5,ageMax:18,cost:"Contact for pricing",website:"https://touchdowndance.co.uk",needs:["Visual Impairment","Multiple Disabilities"],access:["1:1 support"],days:["Various"],factChecked:false,ownerId:"seed"},
  {id:"act-026",name:"Integrated Youth Dance",organisation:"Stopgap Dance Company",category:"activity",type:"Dance",location:"Farnham, Surrey",postcode:"GU9",lat:51.214,lng:-0.798,description:"Inclusive youth dance education using the IRIS inclusive syllabus for disabled children and young people.",ageMin:7,ageMax:18,cost:"Contact for pricing",website:"https://www.stopgapdance.com",needs:["Physical Disabilities","Learning Disabilities"],access:["Wheelchair accessible"],days:["Weekly"],factChecked:false,ownerId:"seed"},
  {id:"act-027",name:"Multi-Sensory Centre",organisation:"Pendragon Community Trust",category:"activity",type:"Sensory",location:"Northallerton",postcode:"DL6",lat:54.34,lng:-1.44,description:"Padded multi-sensory centre with soft play, ball pool and hoisting facilities for children with SEND.",ageMin:0,ageMax:18,cost:"Contact for pricing",website:"https://www.pendragon-ct.org",needs:["Sensory Processing","Multiple Disabilities","Physical Disabilities"],access:["Wheelchair accessible","Sensory-friendly"],days:["Various"],factChecked:false,ownerId:"seed"},
  {id:"act-028",name:"Inclusive Sensory Soft Play",organisation:"Lumiere Charity",category:"activity",type:"Sensory",location:"Liverpool",postcode:"L1",lat:53.408,lng:-2.978,description:"Inclusive sensory soft play centre for children with additional needs — specialist equipment throughout.",ageMin:0,ageMax:16,cost:"Contact for pricing",website:"https://www.lumierecharity.org",needs:["Sensory Processing","Multiple Disabilities","Autism"],access:["Wheelchair accessible","Sensory-friendly"],days:["Various"],factChecked:false,ownerId:"seed"},
  {id:"act-029",name:"Sense Hub Activities",organisation:"Sense Northern Ireland",category:"activity",type:"Sensory",location:"Belfast",postcode:"BT7",lat:54.594,lng:-5.934,description:"Activities, music and sensory sessions for children under 12 with sensory impairments and complex needs.",ageMin:0,ageMax:12,cost:"Contact for pricing",contactPhone:"028 9083 3430",website:"https://www.sense.org.uk",needs:["Multiple Disabilities","Sensory Processing","Visual Impairment"],access:["Wheelchair accessible","Sensory-friendly"],days:["Various"],factChecked:false,ownerId:"seed"},
  {id:"act-030",name:"Adventure Play for Disabled Children",organisation:"The Yard Scotland",category:"activity",type:"Play scheme",location:"Edinburgh",postcode:"EH3",lat:55.957,lng:-3.197,description:"Adventure play services and term-time sessions for disabled children, young people and their families.",ageMin:0,ageMax:18,cost:"£8 per month membership",website:"https://www.theyardscotland.org.uk",needs:["Physical Disabilities","Learning Disabilities","Multiple Disabilities"],access:["Wheelchair accessible","Sensory-friendly"],days:["Monday","Friday"],factChecked:false,ownerId:"seed"},
  {id:"act-031",name:"Early Years Inclusive Play",organisation:"The Very Inclusive Play Club",category:"activity",type:"Play scheme",location:"Edinburgh",postcode:"EH16",lat:55.925,lng:-3.158,description:"Structured weekly groups and free-play sessions for children aged 0–6 with additional support needs.",ageMin:0,ageMax:6,cost:"Subsidised places available",website:"https://www.theveryinclusiveplayclub.com",needs:["Physical Disabilities","Learning Disabilities","Sensory Processing"],access:["Wheelchair accessible","Sensory-friendly"],days:["Monday","Tuesday","Thursday"],factChecked:false,ownerId:"seed"},
  {id:"act-032",name:"After School & Holiday Club",organisation:"Sight Scotland",category:"activity",type:"After school club",location:"Edinburgh",postcode:"EH10",lat:55.927,lng:-3.218,description:"After-school and holiday club specifically for children with visual impairments and complex needs.",ageMin:5,ageMax:18,cost:"Contact for pricing",contactPhone:"0131 446 3136",website:"https://sightscotland.org.uk",needs:["Visual Impairment","Multiple Disabilities"],access:["1:1 support"],days:["Weekdays","Holidays"],factChecked:false,ownerId:"seed"},
  {id:"act-033",name:"Youth Matters Activities",organisation:"The Cedar Foundation",category:"activity",type:"Youth club",location:"Belfast",postcode:"BT9",lat:54.582,lng:-5.942,description:"Confidence and adventure activities for young people with physical and sensory conditions including cerebral palsy.",ageMin:11,ageMax:18,cost:"Contact for pricing",contactEmail:"youthmatters@cedar-foundation.org",contactPhone:"028 9046 1834",website:"https://cedar-foundation.org",needs:["Cerebral Palsy","Physical Disabilities","Sensory Processing"],access:["Wheelchair accessible"],days:["Various"],factChecked:false,ownerId:"seed"},
  {id:"act-034",name:"Disability Sport & Leisure",organisation:"Bradford Disability Sport",category:"activity",type:"Sports",location:"Bradford",postcode:"BD3",lat:53.793,lng:-1.749,description:"Multi-sport club including swimming, basketball, cricket, karate, athletics and cycling for disabled children.",ageMin:5,ageMax:18,cost:"Contact for pricing",website:"https://www.bradforddisabilitysport.co.uk",needs:["Physical Disabilities","Learning Disabilities","Visual Impairment"],access:["Wheelchair accessible"],days:["Various"],factChecked:false,ownerId:"seed"},
  {id:"act-035",name:"Holiday Play Scheme",organisation:"Resources for Autism",category:"activity",type:"Holiday club",location:"Barnet, London",postcode:"NW9",lat:51.592,lng:-0.226,description:"Specialist holiday play schemes for autistic young people aged 8–19 with 1:1 support available throughout.",ageMin:8,ageMax:19,cost:"Contact for pricing",website:"https://resourcesforautism.org.uk",needs:["Autism","Learning Disabilities"],access:["1:1 support","Sensory-friendly"],days:["School holidays"],factChecked:false,ownerId:"seed"},
  {id:"act-036",name:"Autism Holiday Club",organisation:"The SENtre",category:"activity",type:"Holiday club",location:"Birmingham",postcode:"B1",lat:52.48,lng:-1.9,description:"Holiday club with structured activities for children on the autism spectrum; soft play and outdoor space.",ageMin:5,ageMax:16,cost:"Contact for pricing",website:"https://thesentre.co.uk",needs:["Autism","Sensory Processing","Communication Difficulties"],access:["Sensory-friendly","1:1 support"],days:["School holidays"],factChecked:false,ownerId:"seed"},
  {id:"act-037",name:"Adapted Cycling",organisation:"Bikeworks All Ability",category:"activity",type:"Cycling",location:"Finsbury Park, London",postcode:"N4",lat:51.564,lng:-0.101,description:"Adapted cycling sessions using tandems, side-by-side cycles and platform trikes at multiple London sites.",ageMin:5,ageMax:18,cost:"Free at Finsbury Park",contactEmail:"info@bikeworks.org.uk",website:"https://www.bikeworks.org.uk",needs:["Physical Disabilities","Learning Disabilities","Visual Impairment"],access:["Wheelchair accessible"],days:["Saturday"],factChecked:false,ownerId:"seed"},
  {id:"act-038",name:"Inclusive Horse Riding",organisation:"New Lodge RDA Centre",category:"activity",type:"Horse riding",location:"Bexley, London",postcode:"DA5",lat:51.449,lng:0.153,description:"Riding facilities for 75–100 regular riders with physical, sensory and learning disabilities; six days a week.",ageMin:4,ageMax:18,cost:"Contact for pricing",website:"https://www.newlodgerdacentre.co.uk",needs:["Physical Disabilities","Sensory Processing","Learning Disabilities"],access:["Wheelchair accessible"],days:["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],factChecked:false,ownerId:"seed"},
  {id:"act-039",name:"Social & Creative Clubs",organisation:"CASPA",category:"activity",type:"Social Skills",location:"Bromley, London",postcode:"BR6",lat:51.368,lng:0.099,description:"Inclusive social clubs, creative workshops and recreational sessions for autistic and neurodivergent children.",ageMin:5,ageMax:18,cost:"Contact for pricing",website:"https://www.caspa.org.uk",needs:["Autism","ADHD","Anxiety"],access:["Sensory-friendly","1:1 support"],days:["Various"],factChecked:false,ownerId:"seed"},
  {id:"act-040",name:"Inclusive Play Activities",organisation:"Little Miracles",category:"activity",type:"Play scheme",location:"Peterborough",postcode:"PE1",lat:52.574,lng:-0.243,description:"Support, play and activities for families with children with additional needs, from birth to age 25.",ageMin:0,ageMax:25,cost:"Free",website:"https://littlemiraclescharity.org.uk",needs:["Multiple Disabilities","Learning Disabilities","Autism"],access:["Wheelchair accessible","Sensory-friendly"],days:["Various"],factChecked:false,ownerId:"seed"},
  {id:"act-041",name:"Inclusive Rugby Sessions",organisation:"Cardiff Rugby Community Foundation",category:"activity",type:"Sports",location:"Cardiff",postcode:"CF43",lat:51.487,lng:-3.176,description:"Saturday inclusive rugby, visually impaired side and wheelchair team plus inclusive holiday camps.",ageMin:6,ageMax:18,cost:"£2.50 per session",contactEmail:"community@cardiffrugby.wales",website:"https://www.cardiffrugby.wales",needs:["Physical Disabilities","Learning Disabilities","Visual Impairment"],access:["Wheelchair accessible"],days:["Saturday"],factChecked:false,ownerId:"seed"},
  {id:"act-042",name:"Inclusive Dance & Arts",organisation:"No Limits Norfolk",category:"activity",type:"Dance",location:"Norwich",postcode:"NR2",lat:52.63,lng:1.3,description:"Inclusive dance and creative arts classes across Norwich and North Norfolk for all ages and abilities.",ageMin:5,ageMax:18,cost:"Contact for pricing",website:"https://familyvoice.org.uk",needs:["Learning Disabilities","Physical Disabilities","Autism"],access:["Wheelchair accessible"],days:["Various"],factChecked:false,ownerId:"seed"},
  {id:"act-043",name:"Forest School & Sensory Exploration",organisation:"Sendsory",category:"activity",type:"Nature",location:"Suffolk",postcode:"IP1",lat:52.06,lng:1.16,description:"Forest School, sensory exploration and music for children aged 4–11 with SEND in outdoor settings.",ageMin:4,ageMax:11,cost:"Contact for pricing",website:"https://infolink.suffolk.gov.uk",needs:["Autism","ADHD","Sensory Processing"],access:["Sensory-friendly","1:1 support"],days:["Various"],factChecked:false,ownerId:"seed"},
  {id:"act-044",name:"Inclusive Basketball",organisation:"Norfolk Hoopstars",category:"activity",type:"Sports",location:"Norwich",postcode:"NR1",lat:52.628,lng:1.297,description:"SEND basketball sessions for juniors aged 5–18 within a welcoming community club.",ageMin:5,ageMax:18,cost:"Contact for pricing",website:"https://www.norfolkhoopstars.co.uk",needs:["Learning Disabilities","Physical Disabilities","Autism"],access:["Wheelchair accessible"],days:["Various"],factChecked:false,ownerId:"seed"},
  {id:"act-045",name:"Activities for Complex Needs",organisation:"Genesis Orwell Mencap",category:"activity",type:"Social Skills",location:"Ipswich",postcode:"IP3",lat:52.052,lng:1.189,description:"Personalised day care and tutored activities for individuals with complex needs.",ageMin:5,ageMax:25,cost:"Contact for pricing",website:"https://infolink.suffolk.gov.uk",needs:["Learning Disabilities","Multiple Disabilities","Physical Disabilities"],access:["Wheelchair accessible"],days:["Weekdays"],factChecked:false,ownerId:"seed"},
  {id:"act-046",name:"Inclusive Dance",organisation:"Anjali Dance Company",category:"activity",type:"Dance",location:"Banbury, Oxfordshire",postcode:"OX16",lat:52.063,lng:-1.338,description:"Contemporary dance company for people with learning disabilities; creative, professional and inclusive.",ageMin:8,ageMax:18,cost:"Contact for pricing",website:"https://www.anjali.co.uk",needs:["Learning Disabilities","Down Syndrome"],access:["Wheelchair accessible"],days:["Weekly"],factChecked:false,ownerId:"seed"},
  {id:"act-047",name:"Inclusive Drama & Creativity",organisation:"Bamboozle Theatre",category:"activity",type:"Drama",location:"Leicester",postcode:"LE2",lat:52.625,lng:-1.133,description:"Multi-sensory theatre experiences and creative drama for SEND children with profound and complex needs.",ageMin:2,ageMax:18,cost:"Contact for pricing",website:"https://www.bamboozletheatre.co.uk",needs:["Multiple Disabilities","PMLD","Sensory Processing"],access:["Wheelchair accessible","Sensory-friendly"],days:["Various"],factChecked:false,ownerId:"seed"},
  {id:"act-048",name:"Stay & Play Disability Sessions",organisation:"Cwtch Together",category:"activity",type:"Play scheme",location:"Cardiff",postcode:"CF11",lat:51.48,lng:-3.19,description:"Weekly disability stay-and-play with soft play, arts and crafts and a dedicated sensory room.",ageMin:0,ageMax:12,cost:"Contact for pricing",website:"https://cwtchtogether.org.uk",needs:["Sensory Processing","Learning Disabilities","Physical Disabilities"],access:["Wheelchair accessible","Sensory-friendly"],days:["Saturday"],factChecked:false,ownerId:"seed"},
  {id:"act-049",name:"Inclusive Activities",organisation:"Autonomie",category:"activity",type:"Youth club",location:"Belfast",postcode:"BT7",lat:54.59,lng:-5.93,description:"Supports inclusion of young disabled people through education, social and leisure activities.",ageMin:5,ageMax:25,cost:"Free",contactEmail:"hello@autonomie.org.uk",contactPhone:"028 9591 8051",website:"http://www.autonomie.org.uk",needs:["Physical Disabilities","Learning Disabilities","Multiple Disabilities"],access:["Wheelchair accessible"],days:["Various"],factChecked:false,ownerId:"seed"},
  {id:"act-050",name:"Inclusive Hockey Coaching",organisation:"Waltham Forest Hockey Club",category:"activity",type:"Sports",location:"Waltham Forest, London",postcode:"E17",lat:51.586,lng:-0.021,description:"Award-winning inclusive hockey coaching sessions and competitions for disabled players of all ages.",ageMin:6,ageMax:18,cost:"Contact for pricing",website:"https://www.walthamforesthockey.co.uk",needs:["Learning Disabilities","Physical Disabilities","Autism"],access:["Wheelchair accessible"],days:["Various"],factChecked:false,ownerId:"seed"},

  // === NEW THERAPIES (research batch 2) ===
  {id:"the-001",name:"Paediatric Neuro Physiotherapy",organisation:"Manchester Neuro Physio",category:"therapy",type:"Physiotherapy",location:"Sale, Manchester",postcode:"M33",lat:53.424,lng:-2.322,description:"Specialist paediatric neurological physiotherapy for children with CP, ABI and developmental delay. Clinic and home visits with no waiting lists.",ageMin:0,ageMax:18,cost:"Contact for pricing",website:"https://www.manchesterneurophysio.co.uk",needs:["Cerebral Palsy","Physical Disabilities","Multiple Disabilities"],access:["Wheelchair accessible"],days:["Weekdays"],factChecked:false,ownerId:"seed"},
  {id:"the-002",name:"Paediatric Neurological Physio",organisation:"Liverpool Neuro Physio",category:"therapy",type:"Physiotherapy",location:"Liverpool",postcode:"L1",lat:53.408,lng:-2.978,description:"Neurological physiotherapy for children of all ages and abilities including home and clinic appointments.",ageMin:0,ageMax:18,cost:"Contact for pricing",website:"https://www.liverpoolneurophysio.co.uk",needs:["Cerebral Palsy","Physical Disabilities"],access:["Wheelchair accessible"],days:["Weekdays"],factChecked:false,ownerId:"seed"},
  {id:"the-003",name:"Specialist Paediatric Physio",organisation:"Bumble Bee Physio",category:"therapy",type:"Physiotherapy",location:"South Hampstead, London",postcode:"NW6",lat:51.543,lng:-0.178,description:"Specialist paediatric neuro physio including DMI and Targeted Training for Rett syndrome, CP, Angelman syndrome, autism and Down syndrome.",ageMin:0,ageMax:18,cost:"Contact for pricing",website:"https://bumblebeephysio.co.uk",needs:["Cerebral Palsy","Physical Disabilities","Autism"],access:["Wheelchair accessible"],days:["Weekdays"],factChecked:false,ownerId:"seed"},
  {id:"the-004",name:"Neuro Physiotherapy for Children",organisation:"Children's Neuro Physio",category:"therapy",type:"Physiotherapy",location:"Twickenham, London",postcode:"TW1",lat:51.449,lng:-0.337,description:"Neurological physiotherapy for babies and children including aquatic and sensory integration approaches.",ageMin:0,ageMax:18,cost:"Contact for pricing",website:"http://www.cnphys.co.uk",needs:["Cerebral Palsy","Physical Disabilities","Multiple Disabilities"],access:["Wheelchair accessible"],days:["Weekdays"],factChecked:false,ownerId:"seed"},
  {id:"the-005",name:"Paediatric Neuro Rehab",organisation:"Neurotherapy Worx",category:"therapy",type:"Physiotherapy",location:"Warrington",postcode:"WA1",lat:53.39,lng:-2.59,description:"Paediatric neurological physio plus aquatic therapy for cerebral palsy, neuromuscular conditions and developmental delay.",ageMin:0,ageMax:18,cost:"Contact for pricing",website:"https://www.neurotherapyworx.co.uk",needs:["Cerebral Palsy","Physical Disabilities","Multiple Disabilities"],access:["Wheelchair accessible"],days:["Weekdays"],factChecked:false,ownerId:"seed"},
  {id:"the-006",name:"Yorkshire Children's Physiotherapy",organisation:"PEAK Physiotherapy",category:"therapy",type:"Physiotherapy",location:"Leeds",postcode:"LS1",lat:53.801,lng:-1.548,description:"Specialist paediatric neuro physio for GMFCS levels 1–5 in clinics and mobile across Yorkshire.",ageMin:0,ageMax:18,cost:"Contact for pricing",contactPhone:"07908 684441",website:"https://yorkshirechildrensphysio.com",needs:["Cerebral Palsy","Physical Disabilities"],access:["Wheelchair accessible"],days:["Weekdays"],factChecked:false,ownerId:"seed"},
  {id:"the-007",name:"Physiotherapy for Children",organisation:"Physiotherapy for Children Ltd",category:"therapy",type:"Physiotherapy",location:"Wakefield",postcode:"WF1",lat:53.683,lng:-1.499,description:"Specialist physio for children with neurological and musculoskeletal problems in home, school and community settings.",ageMin:0,ageMax:18,cost:"Contact for pricing",website:"https://physioforchildren.co.uk",needs:["Cerebral Palsy","Physical Disabilities","Multiple Disabilities"],access:["Wheelchair accessible"],days:["Weekdays"],factChecked:false,ownerId:"seed"},
  {id:"the-008",name:"Paediatric Neuro-Rehab",organisation:"NPP Neuro Group",category:"therapy",type:"Physiotherapy",location:"Stoke-on-Trent",postcode:"ST1",lat:53.026,lng:-2.175,description:"Multidisciplinary paediatric neuro-rehab including physio, OT, SLT and neuropsychology for CP, ABI and developmental delay.",ageMin:0,ageMax:18,cost:"Contact for pricing",website:"https://nppneurogroup.com",needs:["Cerebral Palsy","Physical Disabilities","Communication Difficulties"],access:["Wheelchair accessible"],days:["Weekdays"],factChecked:false,ownerId:"seed"},
  {id:"the-009",name:"Paediatric Neuro Physio",organisation:"Harborne Physiotherapy Clinic",category:"therapy",type:"Physiotherapy",location:"Harborne, Birmingham",postcode:"B17",lat:52.458,lng:-1.946,description:"Specialist neuro-developmental physio for children with cerebral palsy, SDR, SMA, Duchenne and spina bifida.",ageMin:0,ageMax:18,cost:"Contact for pricing",website:"https://harbornephysio.co.uk",needs:["Cerebral Palsy","Physical Disabilities","Multiple Disabilities"],access:["Wheelchair accessible"],days:["Weekdays"],factChecked:false,ownerId:"seed"},
  {id:"the-010",name:"Physiotherapy Across Scotland",organisation:"Movement Physiotherapy",category:"therapy",type:"Physiotherapy",location:"West Lothian, Scotland",postcode:"EH48",lat:55.9,lng:-3.54,description:"Private paediatric and adult neuro physio across Scotland; clinic, home and remote intensive rehabilitation blocks.",ageMin:0,ageMax:18,cost:"Contact for pricing",website:"https://movementphysiotherapy.co.uk",needs:["Cerebral Palsy","Physical Disabilities","Multiple Disabilities"],access:["Wheelchair accessible"],days:["Weekdays"],factChecked:false,ownerId:"seed"},
  {id:"the-011",name:"Children's Physio Scotland",organisation:"Kids Physio Scotland",category:"therapy",type:"Physiotherapy",location:"Glasgow",postcode:"G42",lat:55.836,lng:-4.261,description:"Advanced practice paediatric physiotherapy for childhood injuries, disabilities and neurological conditions.",ageMin:0,ageMax:18,cost:"Contact for pricing",contactEmail:"info@kidsphysioscotland.co.uk",contactPhone:"07913 219606",website:"https://kidsphysioscotland.co.uk",needs:["Cerebral Palsy","Physical Disabilities"],access:["Wheelchair accessible"],days:["Weekdays"],factChecked:false,ownerId:"seed"},
  {id:"the-012",name:"Conductive Education",organisation:"Steps Conductive Education Centre",category:"therapy",type:"Conductive Education",location:"Shepshed, Leicestershire",postcode:"LE12",lat:52.77,lng:-1.28,description:"Free Conductive Education for children with CP, Down syndrome and motor delays, serving over 50 families a year across the East Midlands.",ageMin:0,ageMax:11,cost:"Free",website:"https://www.stepscec.org.uk",needs:["Cerebral Palsy","Down Syndrome","Physical Disabilities"],access:["Wheelchair accessible","1:1 support"],days:["Monday","Tuesday","Wednesday"],factChecked:false,ownerId:"seed"},
  {id:"the-013",name:"CE School Northern Ireland",organisation:"Buddy Bear Trust",category:"therapy",type:"Conductive Education",location:"Dungannon, Co. Tyrone",postcode:"BT71",lat:54.508,lng:-6.765,description:"Northern Ireland's only Conductive Education school for children with cerebral palsy and motor disorders.",ageMin:2,ageMax:11,cost:"Contact for pricing",website:"https://www.buddybeartrust.com",needs:["Cerebral Palsy","Physical Disabilities","Multiple Disabilities"],access:["Wheelchair accessible","1:1 support"],days:["Weekdays"],factChecked:false,ownerId:"seed"},
  {id:"the-014",name:"Conductive Education Sessions",organisation:"Conductive Education Bristol",category:"therapy",type:"Conductive Education",location:"Bristol",postcode:"BS5",lat:51.456,lng:-2.561,description:"Weekly CE sessions plus home and school visits for children with neurological movement disorders.",ageMin:0,ageMax:11,cost:"Contact for pricing",website:"https://conductiveeducationbristol.org.uk",needs:["Cerebral Palsy","Physical Disabilities","Down Syndrome"],access:["Wheelchair accessible","1:1 support"],days:["Weekly"],factChecked:false,ownerId:"seed"},
  {id:"the-015",name:"Sensory Integration OT",organisation:"Kids In Sync South West",category:"therapy",type:"Occupational Therapy",location:"Twickenham, London",postcode:"TW1",lat:51.449,lng:-0.337,description:"Specialist paediatric OT and sensory integration therapy for children aged 0–14.",ageMin:0,ageMax:14,cost:"Contact for pricing",website:"https://www.kidsinsyncsw.com",needs:["Autism","Sensory Processing","ADHD"],access:["Sensory-friendly"],days:["Weekdays"],factChecked:false,ownerId:"seed"},
  {id:"the-016",name:"Paediatric OT & Sensory Integration",organisation:"Children's Sensory Therapy",category:"therapy",type:"Occupational Therapy",location:"Midlands",postcode:"B1",lat:52.48,lng:-1.9,description:"Paediatric OTs specialising in Ayres Sensory Integration and Sensory Attachment Intervention.",ageMin:0,ageMax:18,cost:"Contact for pricing",website:"https://childrenssensorytherapy.co.uk",needs:["Autism","Sensory Processing","ADHD"],access:["Sensory-friendly"],days:["Weekdays"],factChecked:false,ownerId:"seed"},
  {id:"the-017",name:"Children's OT",organisation:"OT for Kids",category:"therapy",type:"Occupational Therapy",location:"London",postcode:"SW1",lat:51.498,lng:-0.135,description:"Children's OT including sensory integration therapy and groups for ages 0–18, in clinic, home and school.",ageMin:0,ageMax:18,cost:"Contact for pricing",website:"https://www.otforkids.co.uk",needs:["Sensory Processing","Autism","Physical Disabilities"],access:["Sensory-friendly"],days:["Weekdays"],factChecked:false,ownerId:"seed"},
  {id:"the-018",name:"Multidisciplinary Paediatric Therapy",organisation:"Maximum Potential",category:"therapy",type:"Occupational Therapy",location:"Central London",postcode:"W1",lat:51.516,lng:-0.154,description:"Multidisciplinary paediatric therapy including OT, physio, SALT, play therapy and psychology using SI and NDT approaches.",ageMin:0,ageMax:18,cost:"Contact for pricing",contactPhone:"020 7486 4747",website:"https://maximumpotential.org.uk",needs:["Sensory Processing","Autism","Multiple Disabilities"],access:["Sensory-friendly"],days:["Weekdays","Saturday"],factChecked:false,ownerId:"seed"},
  {id:"the-019",name:"Paediatric OT Assessment & Therapy",organisation:"Sensational Kids Therapy",category:"therapy",type:"Occupational Therapy",location:"UK",postcode:"GU1",lat:51.24,lng:-0.57,description:"Paediatric OT assessment and therapy for ASD, ADHD, dyspraxia, sensory processing disorder and developmental delay.",ageMin:0,ageMax:19,cost:"Contact for pricing",website:"https://sensationalkids.co.uk",needs:["Autism","ADHD","Sensory Processing"],access:["Sensory-friendly"],days:["Weekdays"],factChecked:false,ownerId:"seed"},
  {id:"the-020",name:"OT & Sensory Integration",organisation:"Seirrah Occupational Therapy",category:"therapy",type:"Occupational Therapy",location:"Cardiff",postcode:"CF5",lat:51.481,lng:-3.215,description:"Independent OT, SLT and sensory integration services for individuals aged 0–25 including LEGO-based therapy.",ageMin:0,ageMax:25,cost:"Contact for pricing",website:"https://www.seirrah-ot.co.uk",needs:["Autism","Sensory Processing","Communication Difficulties"],access:["Sensory-friendly"],days:["Weekdays","Evenings"],factChecked:false,ownerId:"seed"},
  {id:"the-021",name:"Paediatric OT Services",organisation:"Sensory Children",category:"therapy",type:"Occupational Therapy",location:"UK",postcode:"BS1",lat:51.454,lng:-2.588,description:"Paediatric OT, sensory integration therapy and feeding therapy for children with a range of conditions.",ageMin:0,ageMax:18,cost:"Contact for pricing",website:"https://sensorychildren.co.uk",needs:["Sensory Processing","Autism","Communication Difficulties"],access:["Sensory-friendly"],days:["Weekdays"],factChecked:false,ownerId:"seed"},
  {id:"the-022",name:"Private Speech & Language Therapy",organisation:"London Speech Therapy",category:"therapy",type:"Speech & Language Therapy",location:"London",postcode:"EC1",lat:51.522,lng:-0.099,description:"Assessment and therapy for autism, stammering, developmental language disorder and complex communication needs.",ageMin:0,ageMax:18,cost:"Contact for pricing",website:"https://www.londonspeechtherapy.co.uk",needs:["Autism","Communication Difficulties"],access:["1:1 support"],days:["Weekdays"],factChecked:false,ownerId:"seed"},
  {id:"the-023",name:"Neurodiversity-Affirming SLT",organisation:"Magic Words Therapy",category:"therapy",type:"Speech & Language Therapy",location:"London & Home Counties",postcode:"RG1",lat:51.455,lng:-0.978,description:"Private neurodiversity-affirming, play-based speech and language therapy in clinic, school or online.",ageMin:0,ageMax:18,cost:"Contact for pricing",website:"https://www.magicwordstherapy.co.uk",needs:["Communication Difficulties","Autism","Learning Disabilities"],access:["1:1 support"],days:["Weekdays"],factChecked:false,ownerId:"seed"},
  {id:"the-024",name:"SLT for Children",organisation:"Unlocking Language",category:"therapy",type:"Speech & Language Therapy",location:"Canary Wharf, London",postcode:"E14",lat:51.504,lng:-0.019,description:"SLT for children and young people including autism diagnosis support and dysphagia specialists.",ageMin:0,ageMax:18,cost:"Contact for pricing",website:"https://unlockinglanguage.co.uk",needs:["Communication Difficulties","Autism"],access:["1:1 support"],days:["Weekdays"],factChecked:false,ownerId:"seed"},
  {id:"the-025",name:"Hydrotherapy",organisation:"Therapy Stars",category:"therapy",type:"Hydrotherapy",location:"Shropshire",postcode:"SY1",lat:52.71,lng:-2.75,description:"Purpose-built hydrotherapy pool with sensory features for children with cerebral palsy and hypermobility; 1:1 sessions.",ageMin:0,ageMax:18,cost:"Contact for pricing",website:"https://therapystars.co.uk",needs:["Cerebral Palsy","Physical Disabilities","Multiple Disabilities"],access:["Wheelchair accessible","Sensory-friendly"],days:["Saturday"],factChecked:false,ownerId:"seed"},
  {id:"the-026",name:"Accessible Hydrotherapy Pool",organisation:"The Chamwell Centre",category:"therapy",type:"Hydrotherapy",location:"Gloucester",postcode:"GL2",lat:51.864,lng:-2.244,description:"Accessible hydrotherapy pool and tailored group sessions for children with disabilities and additional needs.",ageMin:0,ageMax:18,cost:"£7.50 per 45 min",contactEmail:"Bookings@chamwellcentre.org.uk",website:"https://www.chamwellcentre.org.uk",needs:["Cerebral Palsy","Physical Disabilities","Multiple Disabilities"],access:["Wheelchair accessible","Sensory-friendly"],days:["Weekly"],factChecked:false,ownerId:"seed"},
  {id:"the-027",name:"Hydrotherapy & Physiotherapy",organisation:"Lymden Hydrotherapy",category:"therapy",type:"Hydrotherapy",location:"Surrey",postcode:"RH1",lat:51.234,lng:-0.151,description:"Hydrotherapy pool and physio clinic with paediatric aquatic physiotherapists and intensive rehabilitation blocks.",ageMin:0,ageMax:18,cost:"Contact for pricing",contactPhone:"01737 919094",website:"https://lhap.co.uk",needs:["Cerebral Palsy","Physical Disabilities","Multiple Disabilities"],access:["Wheelchair accessible"],days:["Weekdays"],factChecked:false,ownerId:"seed"},
  {id:"the-028",name:"Community Music Therapy",organisation:"Ealing Music Therapy",category:"therapy",type:"Music Therapy",location:"Ealing, London",postcode:"W5",lat:51.513,lng:-0.3,description:"Charity providing music therapy in schools and community settings for children with a range of diagnoses.",ageMin:0,ageMax:18,cost:"Contact for pricing",website:"https://ealingmusictherapy.org",needs:["Communication Difficulties","Autism","Learning Disabilities"],access:["Sensory-friendly"],days:["Weekdays"],factChecked:false,ownerId:"seed"},
  {id:"the-029",name:"Music Therapy for Disabled Children",organisation:"Jessie's Fund",category:"therapy",type:"Music Therapy",location:"York",postcode:"YO1",lat:53.96,lng:-1.087,description:"Charity using music therapy to support seriously ill and disabled children across the UK.",ageMin:0,ageMax:18,cost:"Free",website:"https://jessiesfund.org.uk",needs:["Multiple Disabilities","Communication Difficulties","Learning Disabilities"],access:["Sensory-friendly"],days:["Various"],factChecked:false,ownerId:"seed"},
  {id:"the-030",name:"Music Therapy Services",organisation:"Music Therapy Works",category:"therapy",type:"Music Therapy",location:"Nottingham",postcode:"NG1",lat:52.954,lng:-1.158,description:"Charity providing music therapy for children and adults in health and education settings across the Midlands.",ageMin:0,ageMax:18,cost:"Contact for pricing",website:"https://www.musictherapyworks.co.uk",needs:["Communication Difficulties","Learning Disabilities","Autism"],access:["Sensory-friendly"],days:["Various"],factChecked:false,ownerId:"seed"},
  {id:"the-031",name:"Music Therapy at Home",organisation:"Thomas's Fund",category:"therapy",type:"Music Therapy",location:"Northampton",postcode:"NN1",lat:52.237,lng:-0.896,description:"Music therapy for children aged 0–19 with life-limiting conditions or disabilities, at home and in hospital.",ageMin:0,ageMax:19,cost:"Free",website:"https://www.thomassfund.org",needs:["Multiple Disabilities","Communication Difficulties"],access:["Sensory-friendly"],days:["Various"],factChecked:false,ownerId:"seed"},
  {id:"the-032",name:"Children's Art Therapy",organisation:"Children Arts Therapy",category:"therapy",type:"Art Therapy",location:"Hertfordshire",postcode:"WD6",lat:51.659,lng:-0.327,description:"Arts therapy including art, music and drama for children aged 3–15 with emotional, behavioural and communication needs.",ageMin:3,ageMax:15,cost:"Contact for pricing",website:"https://childrenartstherapy.com",needs:["Anxiety","Autism","Communication Difficulties"],access:["Sensory-friendly"],days:["Weekdays"],factChecked:false,ownerId:"seed"},
  {id:"the-033",name:"School-Based Art Therapy",organisation:"Arts Therapies for Children",category:"therapy",type:"Art Therapy",location:"Barnet, London",postcode:"N12",lat:51.614,lng:-0.176,description:"Subsidised art therapy in community primary schools for children aged 5–11 affected by trauma, anxiety and autism.",ageMin:5,ageMax:11,cost:"Subsidised",website:"https://www.artstherapies.org.uk",needs:["Anxiety","Autism","ADHD"],access:["Sensory-friendly"],days:["Weekdays"],factChecked:false,ownerId:"seed"},
  {id:"the-034",name:"Creative Therapies for Children",organisation:"Kids Inspire",category:"therapy",type:"Art Therapy",location:"Chelmsford, Essex",postcode:"CM2",lat:51.736,lng:0.475,description:"Creative arts, play, drama and family therapy for children and young people using a trauma-informed approach.",ageMin:5,ageMax:18,cost:"Contact for pricing",website:"https://www.kidsinspire.org.uk",needs:["Anxiety","Autism","Communication Difficulties"],access:["Sensory-friendly"],days:["Weekdays"],factChecked:false,ownerId:"seed"},
  {id:"the-035",name:"Rebound Therapy",organisation:"UA Cheshire",category:"therapy",type:"Rebound Therapy",location:"Winsford, Cheshire",postcode:"CW7",lat:53.19,lng:-2.524,description:"Trampoline-based rebound therapy for disabled children in a purpose-built facility.",ageMin:2,ageMax:18,cost:"Contact for pricing",contactEmail:"info@uacheshire.co.uk",contactPhone:"01606 212690",website:"https://uacheshire.co.uk",needs:["Physical Disabilities","Multiple Disabilities","Sensory Processing"],access:["Wheelchair accessible","1:1 support"],days:["Monday","Wednesday","Thursday"],factChecked:false,ownerId:"seed"},
  {id:"the-036",name:"Rebound Therapy",organisation:"The Wingate Centre",category:"therapy",type:"Rebound Therapy",location:"Nantwich, Cheshire",postcode:"CW5",lat:53.068,lng:-2.523,description:"Rebound therapy in a fully equipped gymnasium with qualified coaches and specialist equipment.",ageMin:2,ageMax:18,cost:"Contact for pricing",contactEmail:"office@thewingatecentre.co.uk",contactPhone:"01270 780456",website:"https://www.thewingatecentre.co.uk",needs:["Physical Disabilities","Multiple Disabilities"],access:["Wheelchair accessible","1:1 support"],days:["Weekdays"],factChecked:false,ownerId:"seed"},
  {id:"the-037",name:"Rebound Therapy",organisation:"Greenbank Sports Academy",category:"therapy",type:"Rebound Therapy",location:"Liverpool",postcode:"L17",lat:53.384,lng:-2.954,description:"Rebound therapy sessions for disabled children at an accessible sports academy.",ageMin:2,ageMax:18,cost:"Contact for pricing",contactEmail:"mark.palmer@greenbank.org",contactPhone:"07576 275846",website:"https://www.greenbank.org",needs:["Physical Disabilities","Multiple Disabilities"],access:["Wheelchair accessible","1:1 support"],days:["Tuesday","Wednesday"],factChecked:false,ownerId:"seed"},
  {id:"the-038",name:"Rebound Therapy",organisation:"Rebounce Sheffield",category:"therapy",type:"Rebound Therapy",location:"Sheffield",postcode:"S2",lat:53.381,lng:-1.47,description:"Rebound therapy at All Saints Sports Centre for disabled children.",ageMin:2,ageMax:18,cost:"£7.50 per 20 min",contactEmail:"jazzowenRT@gmail.com",contactPhone:"07446 116346",website:"https://reboundtherapy.org",needs:["Physical Disabilities","Multiple Disabilities"],access:["Wheelchair accessible","1:1 support"],days:["Saturday"],factChecked:false,ownerId:"seed"},
  {id:"the-039",name:"Rebound Therapy",organisation:"Huddersfield Trampoline Academy",category:"therapy",type:"Rebound Therapy",location:"Huddersfield",postcode:"HD3",lat:53.648,lng:-1.798,description:"1:1 rebound therapy sessions for disabled children with qualified therapists.",ageMin:2,ageMax:18,cost:"Contact for pricing",contactEmail:"julie@thehta.co.uk",contactPhone:"07857 614866",website:"https://www.thehta.co.uk",needs:["Physical Disabilities","Multiple Disabilities"],access:["1:1 support"],days:["Weekdays"],factChecked:false,ownerId:"seed"},
  {id:"the-040",name:"Rebound Therapy",organisation:"Orchard Trust",category:"therapy",type:"Rebound Therapy",location:"Forest of Dean",postcode:"GL16",lat:51.809,lng:-2.615,description:"Floor-level trampoline with overhead hoist; 1:1 and group rebound therapy Monday to Friday.",ageMin:2,ageMax:18,cost:"Contact for pricing",contactEmail:"swimgym@orchard-trust.org.uk",contactPhone:"01594 861720",website:"https://www.orchard-trust.org.uk",needs:["Physical Disabilities","Multiple Disabilities"],access:["Wheelchair accessible","1:1 support"],days:["Weekdays"],factChecked:false,ownerId:"seed"},
  {id:"the-041",name:"Rebound Therapy",organisation:"Sensory and Bounce",category:"therapy",type:"Rebound Therapy",location:"Hereford",postcode:"HR1",lat:52.054,lng:-2.716,description:"30-minute rebound therapy sessions with two practitioners and hoisting equipment on site.",ageMin:2,ageMax:18,cost:"Contact for pricing",contactEmail:"admin@sensoryandbounce.co.uk",contactPhone:"07522 180307",website:"https://reboundtherapy.org",needs:["Physical Disabilities","Multiple Disabilities","Sensory Processing"],access:["Wheelchair accessible","1:1 support"],days:["Weekdays"],factChecked:false,ownerId:"seed"},
  {id:"the-042",name:"Rebound Therapy",organisation:"Epic Partners Nottingham",category:"therapy",type:"Rebound Therapy",location:"Nottingham",postcode:"NG2",lat:52.94,lng:-1.14,description:"Monday rebound therapy sessions at Oliver Hind Youth Club in Nottingham.",ageMin:2,ageMax:18,cost:"Contact for pricing",contactEmail:"info@epicpartners.co.uk",contactPhone:"0115 837 2021",website:"https://www.epicpartners.co.uk",needs:["Physical Disabilities","Multiple Disabilities"],access:["1:1 support"],days:["Monday"],factChecked:false,ownerId:"seed"},
  {id:"the-043",name:"Rebound Therapy",organisation:"Boost Weston-super-Mare",category:"therapy",type:"Rebound Therapy",location:"Weston-super-Mare",postcode:"BS23",lat:51.346,lng:-2.977,description:"Rebound therapy for disabled children in a dedicated facility in Weston-super-Mare.",ageMin:2,ageMax:18,cost:"Contact for pricing",contactEmail:"boosttrampolining@gmail.com",contactPhone:"07714 710850",website:"https://reboundtherapy.org",needs:["Physical Disabilities","Multiple Disabilities"],access:["1:1 support"],days:["Weekdays"],factChecked:false,ownerId:"seed"},
  {id:"the-044",name:"Rebound Therapy",organisation:"Hadrian School",category:"therapy",type:"Rebound Therapy",location:"Benwell, Newcastle",postcode:"NE15",lat:54.97,lng:-1.646,description:"Dedicated Rob Armstrong Rebound Therapy Centre at a special school in Newcastle upon Tyne.",ageMin:2,ageMax:11,cost:"Contact for pricing",website:"https://hadrian.newcastle.sch.uk",needs:["Physical Disabilities","Multiple Disabilities"],access:["Wheelchair accessible","1:1 support"],days:["Weekdays"],factChecked:false,ownerId:"seed"},
  {id:"the-045",name:"Rebound Therapy",organisation:"London Trampoline",category:"therapy",type:"Rebound Therapy",location:"Isleworth, London",postcode:"TW7",lat:51.469,lng:-0.337,description:"1:1 rebound therapy Monday to Friday at Osterley Sports and Athletics Centre.",ageMin:2,ageMax:18,cost:"Contact for pricing",contactEmail:"info@londontrampoline.com",contactPhone:"07565 064244",website:"https://www.londontrampoline.com",needs:["Physical Disabilities","Multiple Disabilities"],access:["1:1 support"],days:["Weekdays"],factChecked:false,ownerId:"seed"},
  {id:"the-046",name:"Rebound Therapy",organisation:"Delyn Recreational Gymnastics Centre",category:"therapy",type:"Rebound Therapy",location:"Flintshire, Wales",postcode:"CH8",lat:53.278,lng:-3.435,description:"Rebound therapy with hoisting equipment, Tuesday to Thursday at a gymnastics centre in North Wales.",ageMin:2,ageMax:18,cost:"Contact for pricing",contactEmail:"headcoach@delyngymnastics.co.uk",contactPhone:"07847 236424",website:"https://www.delyngymnastics.co.uk",needs:["Physical Disabilities","Multiple Disabilities"],access:["Wheelchair accessible","1:1 support"],days:["Tuesday","Wednesday","Thursday"],factChecked:false,ownerId:"seed"},
  {id:"the-047",name:"Rebound Therapy",organisation:"Community Circus Paisley",category:"therapy",type:"Rebound Therapy",location:"Paisley",postcode:"PA3",lat:55.845,lng:-4.406,description:"Rebound therapy team serving the Glasgow and Paisley area.",ageMin:2,ageMax:18,cost:"Contact for pricing",contactEmail:"info@communitycircus.co.uk",website:"https://www.communitycircus.co.uk",needs:["Physical Disabilities","Multiple Disabilities"],access:["1:1 support"],days:["Various"],factChecked:false,ownerId:"seed"},
  {id:"the-048",name:"Disability Trampolining & Rebound Therapy",organisation:"Blackpool Tiggers",category:"therapy",type:"Rebound Therapy",location:"Blackpool",postcode:"FY4",lat:53.789,lng:-3.032,description:"Disability trampolining and rebound therapy for children with additional needs.",ageMin:2,ageMax:18,cost:"Contact for pricing",contactEmail:"bpltiggers@gmail.com",contactPhone:"01253 365734",website:"https://blackpooltiggers.org",needs:["Physical Disabilities","Multiple Disabilities"],access:["1:1 support"],days:["Various"],factChecked:false,ownerId:"seed"},

  // === REMAINING RESEARCH ENTRIES ===
  {id:"act-r01",name:"Bilingual Inclusive Dance",organisation:"DanceFit Wales",category:"activity",type:"Dance",location:"Cardiff",postcode:"CF10",lat:51.481,lng:-3.179,description:"Bilingual inclusive dance and fitness, after-school clubs and holiday courses for SEND children across Cardiff and Newport.",ageMin:4,ageMax:18,cost:"Contact for pricing",website:"https://dancefit.wales",needs:["Learning Disabilities","Autism","Physical Disabilities"],access:["Sensory-friendly"],days:["Various"],factChecked:false,ownerId:"seed"},
  {id:"act-r02",name:"Mixed Abilities Youth Club",organisation:"Mixtup",category:"activity",type:"Youth club",location:"Swansea",postcode:"SA1",lat:51.621,lng:-3.944,description:"Mixed-abilities youth club for 11–25 year-olds with regular trips, activities and confidence-building sessions.",ageMin:11,ageMax:25,cost:"Contact for pricing",website:"https://www.swansea.gov.uk",needs:["Learning Disabilities","Autism","Physical Disabilities"],access:["Wheelchair accessible"],days:["Various"],factChecked:false,ownerId:"seed"},
  {id:"act-r03",name:"Sensory Rooms & Holiday Club",organisation:"ZEN Sensory & Wellness Centre",category:"activity",type:"Sensory",location:"Ripon, North Yorkshire",postcode:"HG4",lat:54.138,lng:-1.524,description:"Four specialist sensory rooms and FEAST holiday clubs for children aged 4–16 with and without additional needs.",ageMin:0,ageMax:16,cost:"Contact for pricing",website:"https://zensbsensory.co.uk",needs:["Sensory Processing","Multiple Disabilities","Autism"],access:["Wheelchair accessible","Sensory-friendly"],days:["Various"],factChecked:false,ownerId:"seed"},
  {id:"act-r04",name:"After-School & Holiday Activities",organisation:"PlaySense",category:"activity",type:"After school club",location:"Newtownabbey",postcode:"BT37",lat:54.664,lng:-5.914,description:"After-school and holiday activity sessions for disabled children up to age 12 in a stimulating and supportive environment.",ageMin:0,ageMax:12,cost:"Contact for pricing",website:"https://www.sense.org.uk",needs:["Multiple Disabilities","Sensory Processing"],access:["Wheelchair accessible","Sensory-friendly"],days:["After school","Holidays"],factChecked:false,ownerId:"seed"},
  {id:"act-r05",name:"Arts & Sensory Activities",organisation:"Eye Arts Club",category:"activity",type:"Arts & Crafts",location:"Eye, Suffolk",postcode:"IP23",lat:52.31,lng:1.15,description:"Arts and performance activities for children with additional needs; sensory room and ramped access throughout.",ageMin:5,ageMax:18,cost:"Contact for pricing",website:"https://infolink.suffolk.gov.uk",needs:["Learning Disabilities","Sensory Processing","Autism"],access:["Wheelchair accessible","Sensory-friendly"],days:["Various"],factChecked:false,ownerId:"seed"},
  {id:"act-r06",name:"Rebound Therapy Sessions",organisation:"Rebounders Liverpool",category:"activity",type:"Sensory",location:"Speke, Liverpool",postcode:"L24",lat:53.354,lng:-2.861,description:"Pre-school, school outreach and SEN rebound therapy sessions in a dedicated venue in Liverpool.",ageMin:0,ageMax:18,cost:"Contact for pricing",contactEmail:"reboundwithnikki@yahoo.com",contactPhone:"07988 841027",website:"https://reboundtherapy.org",needs:["Physical Disabilities","Multiple Disabilities","Sensory Processing"],access:["Wheelchair accessible","1:1 support"],days:["Weekdays"],factChecked:false,ownerId:"seed"},
  {id:"act-r07",name:"Inclusive Horse Riding & Carriage Driving",organisation:"RDA South East Region",category:"activity",type:"Horse riding",location:"Surrey, Sussex & Kent",postcode:"RH1",lat:51.234,lng:-0.151,description:"80+ RDA groups across Surrey, Sussex and Kent offering therapeutic riding and carriage driving for disabled children and adults.",ageMin:4,ageMax:99,cost:"Contact local group",website:"https://www.rda-southeastregion.org.uk",needs:["Physical Disabilities","Autism","Learning Disabilities","Sensory Processing"],access:["Wheelchair accessible"],days:["Weekly"],factChecked:false,ownerId:"seed"},
  {id:"act-r08",name:"Inclusive Mountain Biking",organisation:"Calvert Trust Exmoor",category:"activity",type:"Cycling",location:"Exmoor, Devon",postcode:"EX35",lat:51.239,lng:-3.719,description:"Adventure activities including adapted cycling, archery, canoeing and rock climbing for disabled young people on Exmoor.",ageMin:5,ageMax:18,cost:"Contact for pricing",website:"https://www.calvert-trust.org.uk/exmoor",needs:["Physical Disabilities","Learning Disabilities","Multiple Disabilities"],access:["Wheelchair accessible"],days:["Various"],factChecked:false,ownerId:"seed"},
  {id:"act-r09",name:"Disability Water Sports",organisation:"Calvert Trust Kielder",category:"activity",type:"Sports",location:"Kielder, Northumberland",postcode:"NE48",lat:55.201,lng:-2.548,description:"Wide range of outdoor adventure activities for disabled people and their families at Kielder Water in Northumberland.",ageMin:5,ageMax:18,cost:"Contact for pricing",website:"https://www.calvert-trust.org.uk/kielder",needs:["Physical Disabilities","Learning Disabilities","Multiple Disabilities"],access:["Wheelchair accessible"],days:["Various"],factChecked:false,ownerId:"seed"},
  {id:"act-r10",name:"Inclusive Arts Programme",organisation:"Chickenshed Theatre",category:"activity",type:"Drama",location:"Southgate, London",postcode:"N14",lat:51.636,lng:-0.128,description:"Inclusive theatre workshops where disabled and non-disabled children create performances together. No auditions — everyone is welcome.",ageMin:5,ageMax:25,cost:"Contact for pricing",contactEmail:"info@chickenshed.org.uk",contactPhone:"020 8351 6161",website:"https://www.chickenshed.org.uk",needs:["Autism","Physical Disabilities","Learning Disabilities","Hearing Impairment"],access:["Wheelchair accessible","BSL available"],days:["Saturday","Sunday"],factChecked:false,ownerId:"seed"},
  {id:"act-r11",name:"Inclusive Sailing",organisation:"RYA Sailability",category:"activity",type:"Sports",location:"Nationwide UK",postcode:"RG12",lat:51.417,lng:-0.779,description:"National network of inclusive sailing clubs for disabled people of all ages and abilities across the UK.",ageMin:8,ageMax:18,cost:"Contact local club",website:"https://www.rya.org.uk/sailability",needs:["Physical Disabilities","Visual Impairment","Learning Disabilities"],access:["Wheelchair accessible"],days:["Various"],factChecked:false,ownerId:"seed"},
  {id:"act-r12",name:"Wheelchair Basketball",organisation:"Great Britain Wheelchair Basketball",category:"activity",type:"Sports",location:"Nationwide UK",postcode:"NG1",lat:52.954,lng:-1.158,description:"Club finder for junior wheelchair basketball sessions across the UK for disabled young people.",ageMin:8,ageMax:18,cost:"Contact local club",website:"https://gbwba.org.uk",needs:["Physical Disabilities","Cerebral Palsy"],access:["Wheelchair accessible"],days:["Various"],factChecked:false,ownerId:"seed"},
  {id:"act-r13",name:"Inclusive Cricket",organisation:"Lord's Taverners",category:"activity",type:"Sports",location:"Nationwide UK",postcode:"NW8",lat:51.529,lng:-0.172,description:"Table Cricket and Super 1s disability cricket programme for young people with physical and learning disabilities nationwide.",ageMin:12,ageMax:25,cost:"Free",contactEmail:"info@lordstaverners.org",website:"https://www.lordstaverners.org",needs:["Physical Disabilities","Learning Disabilities","Autism"],access:["Wheelchair accessible"],days:["Various"],factChecked:false,ownerId:"seed"},
  {id:"act-r14",name:"Boccia & Disability Sport",organisation:"Boccia England",category:"activity",type:"Sports",location:"Nationwide UK",postcode:"B6",lat:52.504,lng:-1.878,description:"Club finder for boccia sessions across England, the inclusive Paralympic target sport for disabled young people.",ageMin:5,ageMax:18,cost:"Contact local club",website:"https://www.boccia.org.uk",needs:["Physical Disabilities","Cerebral Palsy","Multiple Disabilities"],access:["Wheelchair accessible"],days:["Various"],factChecked:false,ownerId:"seed"},
  {id:"act-r15",name:"Goalball Sessions",organisation:"British Blind Sport",category:"activity",type:"Sports",location:"Nationwide UK",postcode:"CV21",lat:52.374,lng:-1.264,description:"National disability sport body running goalball, tandem cycling, swimming and other sports for visually impaired young people.",ageMin:8,ageMax:18,cost:"Contact for pricing",contactEmail:"info@britishblindsport.org.uk",website:"https://www.britishblindsport.org.uk",needs:["Visual Impairment"],access:["1:1 support"],days:["Various"],factChecked:false,ownerId:"seed"},
  {id:"act-r16",name:"Disability Climbing",organisation:"British Blind Sport & Adaptive Climbing Group",category:"activity",type:"Sports",location:"Nationwide UK",postcode:"SE1",lat:51.505,lng:-0.088,description:"Adapted climbing sessions for disabled young people; national network of inclusive climbing walls.",ageMin:8,ageMax:18,cost:"Contact for pricing",website:"https://www.adaptiveclimbing.co.uk",needs:["Physical Disabilities","Visual Impairment","Learning Disabilities"],access:["1:1 support"],days:["Various"],factChecked:false,ownerId:"seed"},
  {id:"act-r17",name:"Inclusive Arts & Activities",organisation:"Mencap",category:"activity",type:"Social Skills",location:"Nationwide UK",postcode:"EC1",lat:51.525,lng:-0.108,description:"Mencap Gateway clubs run social, creative and leisure activities for adults and young people with learning disabilities at local branches nationwide.",ageMin:6,ageMax:25,cost:"Contact local club",contactPhone:"0808 808 1111",website:"https://www.mencap.org.uk",needs:["Learning Disabilities","Down Syndrome","Autism"],access:["Wheelchair accessible"],days:["Various"],factChecked:false,ownerId:"seed"},
  {id:"act-r18",name:"Relaxed Performances",organisation:"National Theatre",category:"activity",type:"Drama",location:"South Bank, London",postcode:"SE1",lat:51.507,lng:-0.114,description:"Regular relaxed performances at the National Theatre with adjusted lighting and sound, chill-out spaces and trained front-of-house staff.",ageMin:5,ageMax:18,cost:"Standard ticket; companion free",website:"https://www.nationaltheatre.org.uk/accessibility",needs:["Autism","ADHD","Sensory Processing","Learning Disabilities"],access:["Wheelchair accessible","Sensory-friendly","BSL available"],days:["Selected performances"],factChecked:false,ownerId:"seed"},
  {id:"act-r19",name:"Inclusive Music Sessions",organisation:"Sense",category:"activity",type:"Music",location:"Nationwide UK",postcode:"EC1",lat:51.525,lng:-0.108,description:"Sensory and music sessions for children with sensory impairments and complex needs through the national Sense charity network.",ageMin:0,ageMax:18,cost:"Contact for pricing",website:"https://www.sense.org.uk",needs:["Multiple Disabilities","Sensory Processing","Visual Impairment"],access:["Wheelchair accessible","Sensory-friendly"],days:["Various"],factChecked:false,ownerId:"seed"},
  {id:"act-r20",name:"SEND Swimming Lessons",organisation:"Swimtime",category:"activity",type:"Swimming",location:"Nationwide UK",postcode:"M1",lat:53.48,lng:-2.24,description:"Nationwide network of inclusive swimming lessons for children with disabilities and additional needs at over 400 pools across the UK.",ageMin:0,ageMax:18,cost:"Contact for pricing",website:"https://www.swimtime.org",needs:["Physical Disabilities","Autism","Learning Disabilities"],access:["Wheelchair accessible"],days:["Various"],factChecked:false,ownerId:"seed"},
  {id:"act-r21",name:"Inclusive Performing Arts",organisation:"Carousel",category:"activity",type:"Drama",location:"Brighton",postcode:"BN1",lat:50.827,lng:-0.137,description:"Inclusive arts organisation led by learning disabled people; theatre, music, visual arts and dance for SEND young people.",ageMin:5,ageMax:25,cost:"Contact for pricing",contactEmail:"mail@carousel.org.uk",contactPhone:"01273 234734",website:"https://carousel.org.uk",needs:["Learning Disabilities","Down Syndrome","Autism"],access:["Wheelchair accessible"],days:["Various"],factChecked:false,ownerId:"seed"},
  {id:"act-r22",name:"Inclusive Arts & Drama",organisation:"Heart n Soul",category:"activity",type:"Arts & Crafts",location:"London",postcode:"SE3",lat:51.478,lng:-0.014,description:"Creative arts organisation for learning disabled people including music, theatre, dance and visual arts.",ageMin:5,ageMax:25,cost:"Contact for pricing",website:"https://www.heartnsoul.co.uk",needs:["Learning Disabilities","Autism","Down Syndrome"],access:["Wheelchair accessible"],days:["Various"],factChecked:false,ownerId:"seed"},
  {id:"act-r23",name:"Inclusive Dance Education",organisation:"Stopgap Dance Company",category:"activity",type:"Dance",location:"Farnham, Surrey",postcode:"GU9",lat:51.214,lng:-0.798,description:"Education programme and IRIS inclusive dance syllabus for schools and community groups across the UK.",ageMin:5,ageMax:18,cost:"Contact for pricing",website:"https://www.stopgapdance.com",needs:["Physical Disabilities","Learning Disabilities"],access:["Wheelchair accessible"],days:["Various"],factChecked:false,ownerId:"seed"},
  {id:"act-r24",name:"Deaf-Led Arts",organisation:"Deafinitely Theatre",category:"activity",type:"Drama",location:"London",postcode:"N1",lat:51.531,lng:-0.102,description:"Professional deaf-led theatre company running inclusive drama workshops and BSL performances for deaf and hearing young people.",ageMin:5,ageMax:18,cost:"Contact for pricing",website:"https://www.deafinitelytheatre.co.uk",needs:["Hearing Impairment","Communication Difficulties"],access:["BSL available"],days:["Various"],factChecked:false,ownerId:"seed"},
  {id:"act-r25",name:"Youth Arts Programme",organisation:"Entelechy Arts",category:"activity",type:"Arts & Crafts",location:"London",postcode:"SE8",lat:51.476,lng:-0.023,description:"Participatory arts creating performance and visual art with those furthest from mainstream arts provision including SEND young people.",ageMin:5,ageMax:25,cost:"Contact for pricing",website:"https://www.entelechyarts.org",needs:["Multiple Disabilities","Learning Disabilities","Physical Disabilities"],access:["Wheelchair accessible"],days:["Various"],factChecked:false,ownerId:"seed"},

  // === REMAINING THERAPIES ===
  {id:"the-r01",name:"Play Therapy",organisation:"Maximum Potential",category:"therapy",type:"Play Therapy",location:"Central London",postcode:"W1",lat:51.516,lng:-0.154,description:"Play therapy within a multidisciplinary private paediatric practice alongside OT, physio and SALT.",ageMin:2,ageMax:18,cost:"Contact for pricing",contactPhone:"020 7486 4747",website:"https://maximumpotential.org.uk",needs:["Autism","Anxiety","Communication Difficulties"],access:["Sensory-friendly"],days:["Weekdays","Saturday"],factChecked:false,ownerId:"seed"},
  {id:"the-r02",name:"Aquatic Physiotherapy",organisation:"ATACP Aquatic Therapists",category:"therapy",type:"Hydrotherapy",location:"Nationwide UK",postcode:"SW1",lat:51.498,lng:-0.135,description:"Directory of Aquatic Therapy Association of Chartered Physiotherapists members providing hydrotherapy for children.",ageMin:0,ageMax:18,cost:"Contact for pricing",website:"https://atacp.csp.org.uk",needs:["Cerebral Palsy","Physical Disabilities","Multiple Disabilities"],access:["Wheelchair accessible"],days:["Varies"],factChecked:false,ownerId:"seed"},
  {id:"the-r03",name:"Paediatric Osteopathy",organisation:"Foundation for Paediatric Osteopathy",category:"therapy",type:"Occupational Therapy",location:"London",postcode:"W1",lat:51.516,lng:-0.154,description:"Charity providing osteopathic care for babies and children, subsidised appointments for those with additional needs.",ageMin:0,ageMax:18,cost:"Subsidised",website:"https://fpo.org.uk",needs:["Cerebral Palsy","Physical Disabilities","Multiple Disabilities"],access:["Wheelchair accessible"],days:["Weekdays"],factChecked:false,ownerId:"seed"},
  {id:"the-r04",name:"Yoga for Special Needs",organisation:"Special Yoga",category:"therapy",type:"Occupational Therapy",location:"London",postcode:"NW10",lat:51.534,lng:-0.247,description:"Specialist yoga therapy for children with special needs including autism, cerebral palsy and Down syndrome.",ageMin:2,ageMax:18,cost:"Contact for pricing",website:"https://specialyoga.org.uk",needs:["Autism","Cerebral Palsy","Down Syndrome"],access:["Wheelchair accessible"],days:["Weekdays","Saturday"],factChecked:false,ownerId:"seed"},
  {id:"the-r05",name:"Halliwick Swimming Therapy",organisation:"Halliwick Association of Swimming Therapy",category:"therapy",type:"Hydrotherapy",location:"Nationwide UK",postcode:"SW1",lat:51.498,lng:-0.135,description:"National association promoting water independence for disabled people; club finder for inclusive swimming therapy sessions.",ageMin:0,ageMax:18,cost:"Contact local club",website:"https://www.halliwick.org.uk",needs:["Physical Disabilities","Multiple Disabilities","Cerebral Palsy"],access:["Wheelchair accessible"],days:["Various"],factChecked:false,ownerId:"seed"},
  {id:"the-r06",name:"Conductive Education Centre",organisation:"The Advance Centre",category:"therapy",type:"Conductive Education",location:"Manchester",postcode:"M16",lat:53.455,lng:-2.263,description:"Conductive Education for children with cerebral palsy and neurological movement disorders in the North West.",ageMin:0,ageMax:11,cost:"Contact for pricing",website:"https://advancecentre.org.uk",needs:["Cerebral Palsy","Physical Disabilities"],access:["Wheelchair accessible","1:1 support"],days:["Weekdays"],factChecked:false,ownerId:"seed"},
  {id:"the-r07",name:"Dramatherapy",organisation:"Roundabout Dramatherapy",category:"therapy",type:"Art Therapy",location:"London & South East",postcode:"SE1",lat:51.505,lng:-0.088,description:"Professional dramatherapy for children and young people with additional needs in schools and community settings.",ageMin:4,ageMax:18,cost:"Contact for pricing",website:"https://www.roundaboutdramatherapy.org.uk",needs:["Autism","Anxiety","Communication Difficulties"],access:["1:1 support"],days:["Weekdays"],factChecked:false,ownerId:"seed"},
  {id:"the-r08",name:"Paediatric Occupational Therapy",organisation:"Hemispheres",category:"therapy",type:"Occupational Therapy",location:"London",postcode:"W1",lat:51.516,lng:-0.154,description:"Specialist paediatric OT, speech therapy and psychology for children with developmental needs.",ageMin:0,ageMax:18,cost:"Contact for pricing",website:"https://www.hemispheres.co.uk",needs:["Autism","Sensory Processing","Physical Disabilities"],access:["Sensory-friendly"],days:["Weekdays"],factChecked:false,ownerId:"seed"},
  {id:"the-r09",name:"Paediatric Physiotherapy",organisation:"CP Kids Physio",category:"therapy",type:"Physiotherapy",location:"UK",postcode:"SW1",lat:51.498,lng:-0.135,description:"Specialist physiotherapy for children with cerebral palsy; home visits and clinic appointments available.",ageMin:0,ageMax:18,cost:"Contact for pricing",website:"https://cpkids-physio.co.uk",needs:["Cerebral Palsy","Physical Disabilities"],access:["Wheelchair accessible"],days:["Weekdays"],factChecked:false,ownerId:"seed"},
  {id:"the-r10",name:"Children's Physiotherapy",organisation:"Sure Steps Children's Physiotherapy",category:"therapy",type:"Physiotherapy",location:"UK",postcode:"GU1",lat:51.24,lng:-0.57,description:"Private paediatric physiotherapy for children with neurological and developmental conditions.",ageMin:0,ageMax:18,cost:"Contact for pricing",website:"https://surestepschildrensphysiotherapy.co.uk",needs:["Cerebral Palsy","Physical Disabilities","Multiple Disabilities"],access:["Wheelchair accessible"],days:["Weekdays"],factChecked:false,ownerId:"seed"},
  {id:"the-r11",name:"Paediatric Physiotherapy",organisation:"NAPA Centre",category:"therapy",type:"Physiotherapy",location:"UK",postcode:"BS1",lat:51.454,lng:-2.588,description:"Paediatric neurological physiotherapy for children with cerebral palsy and complex needs.",ageMin:0,ageMax:18,cost:"Contact for pricing",website:"https://napacentre.co.uk",needs:["Cerebral Palsy","Physical Disabilities","Multiple Disabilities"],access:["Wheelchair accessible"],days:["Weekdays"],factChecked:false,ownerId:"seed"},
  {id:"the-r12",name:"Speech & Language Therapy",organisation:"The Speech Clinic",category:"therapy",type:"Speech & Language Therapy",location:"Cardiff",postcode:"CF1",lat:51.481,lng:-3.179,description:"Private speech and language therapy clinic for children with communication difficulties and autism.",ageMin:0,ageMax:18,cost:"Contact for pricing",website:"https://www.thespeechclinic.co.uk",needs:["Communication Difficulties","Autism"],access:["1:1 support"],days:["Weekdays"],factChecked:false,ownerId:"seed"},
  {id:"the-r13",name:"Early Years SLT",organisation:"Baby Speak",category:"therapy",type:"Speech & Language Therapy",location:"UK",postcode:"GU1",lat:51.24,lng:-0.57,description:"Early years speech and language therapy for babies and toddlers with communication and feeding difficulties.",ageMin:0,ageMax:5,cost:"Contact for pricing",website:"https://babyspeak.co.uk",needs:["Communication Difficulties","Sensory Processing"],access:["1:1 support"],days:["Weekdays"],factChecked:false,ownerId:"seed"},
  {id:"the-r14",name:"Paediatric SLT",organisation:"SLT for Kids",category:"therapy",type:"Speech & Language Therapy",location:"UK",postcode:"M1",lat:53.48,lng:-2.24,description:"Private speech and language therapy for children with a range of communication and language needs.",ageMin:0,ageMax:18,cost:"Contact for pricing",website:"https://sltforkids.co.uk",needs:["Communication Difficulties","Autism","Learning Disabilities"],access:["1:1 support"],days:["Weekdays"],factChecked:false,ownerId:"seed"},
  {id:"the-r15",name:"Cerebral Palsy Support",organisation:"Cerebral Palsy England",category:"therapy",type:"Physiotherapy",location:"Nationwide UK",postcode:"NW1",lat:51.528,lng:-0.138,description:"National charity providing therapy referrals, grants and specialist support for children and families affected by cerebral palsy.",ageMin:0,ageMax:18,cost:"Free advice & signposting",website:"https://cerebralpalsyengland.com",needs:["Cerebral Palsy","Physical Disabilities","Multiple Disabilities"],access:["Wheelchair accessible"],days:["Various"],factChecked:false,ownerId:"seed"},
  {id:"the-r16",name:"Specialist Residential Rehabilitation",organisation:"Hollybank Trust",category:"therapy",type:"Physiotherapy",location:"Mirfield, Yorkshire",postcode:"WF14",lat:53.668,lng:-1.688,description:"Specialist residential and day services providing therapy, education and care for children with complex disabilities.",ageMin:0,ageMax:18,cost:"Contact for pricing",website:"https://hollybanktrust.com",needs:["Multiple Disabilities","Physical Disabilities","Cerebral Palsy"],access:["Wheelchair accessible"],days:["Weekdays"],factChecked:false,ownerId:"seed"},
  {id:"the-r17",name:"Specialist Education & Therapy",organisation:"Seashell Trust",category:"therapy",type:"Speech & Language Therapy",location:"Cheadle Hulme, Manchester",postcode:"SK8",lat:53.374,lng:-2.196,description:"Specialist school and college for young people with profound complex needs, including intensive SLT, OT and physio.",ageMin:2,ageMax:19,cost:"Contact for pricing",website:"https://seashelltrust.org.uk",needs:["Multiple Disabilities","Communication Difficulties","Physical Disabilities"],access:["Wheelchair accessible"],days:["Weekdays"],factChecked:false,ownerId:"seed"},
  {id:"the-r18",name:"Multi-Therapy Centre",organisation:"Coram",category:"therapy",type:"Art Therapy",location:"London",postcode:"WC1",lat:51.524,lng:-0.12,description:"Coram's creative therapies including art therapy, play therapy and family therapy for children with additional needs.",ageMin:0,ageMax:18,cost:"Subsidised",website:"https://coram.org.uk",needs:["Autism","Anxiety","Communication Difficulties"],access:["Sensory-friendly"],days:["Weekdays"],factChecked:false,ownerId:"seed"},
  {id:"the-r19",name:"Multi-Sensory Arts Therapy",organisation:"Bag Books",category:"therapy",type:"Art Therapy",location:"London",postcode:"SW8",lat:51.481,lng:-0.125,description:"Multi-sensory storytelling and arts therapy resources and sessions for people with profound and complex learning disabilities.",ageMin:0,ageMax:18,cost:"Contact for pricing",contactPhone:"020 7627 0444",website:"https://www.bagbooks.org",needs:["Multiple Disabilities","Learning Disabilities","Sensory Processing"],access:["Sensory-friendly"],days:["Various"],factChecked:false,ownerId:"seed"},
  {id:"the-r20",name:"Intensive Interaction",organisation:"Intensive Interaction Institute",category:"therapy",type:"Speech & Language Therapy",location:"Nationwide UK",postcode:"BD1",lat:53.795,lng:-1.752,description:"Training and direct therapy using Intensive Interaction approach for people with severe communication difficulties and autism.",ageMin:0,ageMax:18,cost:"Contact for pricing",website:"https://www.intensiveinteraction.org",needs:["Autism","Communication Difficulties","Multiple Disabilities"],access:["1:1 support"],days:["Various"],factChecked:false,ownerId:"seed"},
  {id:"the-r21",name:"Paediatric & Adult Neuro Physiotherapy",organisation:"Birkdale Neuro Rehabilitation Centre",category:"therapy",type:"Physiotherapy",location:"Alperton, London",postcode:"HA0",lat:51.551,lng:-0.311,description:"West London specialist neurological physiotherapy clinic for children and adults, treating cerebral palsy, global developmental delay, Down's syndrome and a wide range of neurological conditions. Over 30 years' experience.",ageMin:0,ageMax:18,cost:"Contact for pricing",contactPhone:"020 8795 2209",website:"https://neuro-physio.co.uk",needs:["Cerebral Palsy","Physical Disabilities","Down Syndrome","Multiple Disabilities"],access:["Wheelchair accessible"],days:["Weekdays"],factChecked:false,ownerId:"seed"},

  {id:"se-act-1",name:"Extratime Inclusive Clubs & Holiday Schemes",organisation:"Extratime",type:"Social Skills",location:"Portslade, Brighton & Hove",postcode:"BN41",lat:50.8400,lng:-0.2180,description:"One of Sussex's largest specialist providers of inclusive play and leisure for children and young people with SEND, based in Portslade. Runs after-school clubs and holiday schemes (all holidays except Christmas) across Brighton & Hove and West Sussex with high staff ratios — creative arts, cookery, dance, music, sport and family fun days.",ageMin:5,ageMax:19,accessibility:["Wheelchair accessible","Step-free access","Quiet space","High staff ratios"],support:"High support ratios (1:1 available)",needs:["Autism","Learning disability","Physical disability","Communication difficulties","Global development delay","Sensory processing"],cost:"Subsidised — see website",funding:["Short Breaks funded","Charity grants available"],days:["Monday","Tuesday","Wednesday","Thursday","Friday"],time:"After-school clubs & school-holiday schemes (not Christmas)",contactName:"Extratime",contactEmail:"Contact via website",contactPhone:"Contact via website",website:"https://www.extratimebrighton.org.uk",factChecked:false,ownerId:"seed"},
  {id:"se-act-2",name:"Thames Valley Adventure Playground",organisation:"Thames Valley Adventure Playground (TVAP)",type:"Nature",location:"Taplow, Berkshire",postcode:"SL6 0AW",lat:51.5350,lng:-0.6920,description:"A fully accessible adventure playground purpose-built for disabled children and adults near Maidenhead. Indoor sensory rooms and soft play plus outdoor accessible swings, a bike and go-kart track, treetop trail and sensory garden — a rare space where disabled children can run, climb and explore safely.",ageMin:0,ageMax:19,accessibility:["Wheelchair accessible","Hoist available","Changing Places toilet","Sensory room","Step-free access","Quiet space"],support:"Staffed sessions",needs:["Autism","Physical disability","Learning disability","Cerebral palsy","Sensory processing","Multiple disabilities"],cost:"Membership & session fees — see website",funding:["Charity grants available"],days:["Tuesday","Wednesday","Thursday","Friday","Saturday"],time:"See website for session times",contactName:"TVAP",contactEmail:"Contact via website",contactPhone:"Contact via website",website:"https://www.tvap.co.uk",factChecked:false,ownerId:"seed"},
  {id:"se-act-3",name:"Anchorians SEND Football",organisation:"Anchorians FC",type:"Sports",location:"Gillingham, Kent",postcode:"ME7 3AN",lat:51.3650,lng:0.5650,description:"Inclusive after-school football sessions for SEND children and young people run by Anchorians FC in Medway. Separate primary and secondary age groups with experienced, supportive coaches in a fun, low-pressure environment.",ageMin:5,ageMax:18,accessibility:["Step-free access","Quiet approach"],support:"Experienced SEND coaches",needs:["Autism","ADHD","Learning disability","Physical disability","Communication difficulties"],cost:"£2 per session",funding:["Self-pay"],days:["Monday","Wednesday"],time:"After school — Wed (5–11), Mon (11–18)",contactName:"Anchorians Team",contactEmail:"info.anchoriansfc@gmail.com",contactPhone:"Contact via email",website:"https://www.anchoriansfc.co.uk",factChecked:false,ownerId:"seed"},
  {id:"se-act-4",name:"Inclusive Dance Sessions",organisation:"The Dance Space",type:"Dance",location:"Brighton",postcode:"BN2 9AS",lat:50.8210,lng:-0.1340,description:"Accessible and inclusive dance and movement sessions at Brighton's purpose-built dance centre, welcoming disabled children and young people. Adapted classes build confidence, creativity and physical expression in a supportive studio.",ageMin:5,ageMax:25,accessibility:["Wheelchair accessible","Step-free access","Changing Places toilet","Quiet space"],support:"Adapted by need",needs:["Autism","Physical disability","Learning disability","Sensory processing","Communication difficulties"],cost:"Contact for pricing",funding:["Self-pay","Charity grants available"],days:["Saturday"],time:"See website for class times",contactName:"The Dance Space",contactEmail:"Contact via website",contactPhone:"Contact via website",website:"https://thedancespace.co.uk",factChecked:false,ownerId:"seed"},
  {id:"se-act-5",name:"Out There Inclusive Youth & Sport",organisation:"Out There",type:"Sports",location:"Horsham, West Sussex",postcode:"RH12 1XB",lat:51.0640,lng:-0.3270,description:"Inclusive youth and sports activities for disabled young people in Horsham, offering sport, social and leisure sessions in an accessible, welcoming setting for those with a wide range of additional needs.",ageMin:11,ageMax:25,accessibility:["Wheelchair accessible","Step-free access","Quiet space"],support:"Trained staff",needs:["Autism","ADHD","Learning disability","Physical disability","Down's syndrome","Sensory processing"],cost:"Contact for pricing",funding:["Short Breaks funded","Self-pay"],days:["Various"],time:"See website",contactName:"Out There",contactEmail:"Contact via website",contactPhone:"Contact via website",website:"https://www.outtheresupport.co.uk",factChecked:false,ownerId:"seed"},
  {id:"se-act-6",name:"Activ8 SEND Holiday Clubs",organisation:"Activ8 for Kids",type:"Sports",location:"Worthing, West Sussex",postcode:"BN13",lat:50.8179,lng:-0.3727,description:"SEND holiday clubs and inclusive movement sessions across West Sussex and Brighton, with 1:1 support funded through short breaks at some sites and free HAF places for eligible children. Arts, sports, sensory play, music and dance adapted to every child.",ageMin:4,ageMax:14,accessibility:["Step-free access","Quiet space","1:1 support available"],support:"1:1 via short-break funding",needs:["Autism","ADHD","Learning disability","Sensory processing","Communication difficulties"],cost:"Free (HAF, if eligible) / paid clubs",funding:["Short Breaks funded","Fully funded"],days:["Various"],time:"School holidays",contactName:"Debbie Webb",contactEmail:"Debbie@activ8forkids.co.uk",contactPhone:"Contact via website",website:"https://www.activ8forkids.co.uk",factChecked:false,ownerId:"seed"},

  {id:"se-ther-1",name:"Independent OT & Speech Therapy",organisation:"Nurture and Connect Therapy",category:"therapy",type:"Occupational Therapy",location:"Reading, Berkshire",postcode:"RG1",lat:51.4543,lng:-0.9781,description:"Small team of independent occupational therapists and speech & language therapists for children, covering Berkshire and South Oxfordshire. Supports sensory processing, handwriting, organisation and communication, working closely with parents at home and school.",ageMin:0,ageMax:18,cost:"Private — contact for fees",contactEmail:"Contact via website",website:"https://www.nct-therapy.co.uk",needs:["Autism","Sensory processing","Communication difficulties","Global development delay","ADHD"],accessibility:["Home & school visits"],support:"1:1",days:["Weekdays"],funding:["Self-pay"],factChecked:false,ownerId:"seed"},
  {id:"se-ther-2",name:"Children's Speech & Sensory Therapy",organisation:"Alexandra Speech & Sensory Clinic",category:"therapy",type:"Speech & Language Therapy",location:"Bournemouth, Dorset",postcode:"BH1",lat:50.7200,lng:-1.8800,description:"Private children's speech and language therapy in Dorset for language and communication difficulties, with individualised plans and a sensory-aware approach to help every child find their voice.",ageMin:0,ageMax:16,cost:"Private — contact for fees",contactEmail:"Contact via website",website:"https://alexandraspeechclinic.com",needs:["Autism","Communication difficulties","Sensory processing","Global development delay"],accessibility:["Clinic & home visits"],support:"1:1",days:["Weekdays"],funding:["Self-pay"],factChecked:false,ownerId:"seed"},
  {id:"se-ther-3",name:"Children's Speech & Language Therapy (NHS)",organisation:"Berkshire Healthcare NHS Foundation Trust",category:"therapy",type:"Speech & Language Therapy",location:"Reading, Berkshire",postcode:"RG30",lat:51.4500,lng:-1.0000,description:"NHS speech and language therapy for children and young people up to 19 across Berkshire, with occupational therapy also available. Assessments in clinic, school or at home. Referrals via SENCO, GP or online form.",ageMin:0,ageMax:19,cost:"Free — NHS",contactEmail:"Contact via website",website:"https://www.berkshirehealthcare.nhs.uk",needs:["Autism","Communication difficulties","Hearing impairment","Global development delay","Learning disability"],accessibility:["Clinic, school & home"],support:"NHS pathway",days:["Weekdays"],funding:["NHS funded"],factChecked:false,ownerId:"seed"},

  {id:"se-char-1",category:"charity",name:"For Us Too — East Kent",organisation:"For Us Too",type:"Social Skills",location:"Canterbury, East Kent",postcode:"CT1",lat:51.2802,lng:1.0789,description:"Charity run by parents and carers of disabled children across East Kent (Thanet, Swale and Canterbury). Free membership giving access to a helpline, play and support groups, a toy library, family events and days out, workshops and ongoing family support.",ageMin:0,ageMax:25,accessibility:["Family events vary by venue"],support:"Family Support Officer",needs:["Autism","Learning disability","Physical disability","ADHD","Communication difficulties","Multiple disabilities"],cost:"Free — charity services",funding:["Fully funded","Charity grants available"],days:["Monday","Tuesday","Wednesday","Thursday","Friday"],time:"Helpline & events — see website",contactName:"For Us Too",contactEmail:"Contact via website",contactPhone:"Contact via website",website:"https://www.forustoo.org",factChecked:false,ownerId:"seed"},
  {id:"se-char-2",category:"charity",name:"We Are Beams — Disabled Children's Support",organisation:"We Are Beams",type:"Social Skills",location:"West Malling, Kent",postcode:"ME19",lat:51.2930,lng:0.4080,description:"Kent charity supporting disabled children, young people and their families with a free family advice service, play and youth opportunities and practical guidance on EHCPs, therapies and benefits across the county.",ageMin:0,ageMax:25,accessibility:["Step-free access","Quiet space"],support:"Family advice service",needs:["Autism","Learning disability","Physical disability","Cerebral palsy","Communication difficulties","Multiple disabilities"],cost:"Free — charity services",funding:["Charity grants available","Fully funded"],days:["Monday","Tuesday","Wednesday","Thursday","Friday"],time:"Advice line — see website",contactName:"We Are Beams",contactEmail:"Contact via website",contactPhone:"Contact via website",website:"https://wearebeams.org.uk",factChecked:false,ownerId:"seed"},
  {id:"se-char-3",category:"charity",name:"CrackerJacks Children's Trust — Equipment Grants",organisation:"CrackerJacks Children's Trust",type:"Social Skills",location:"South West / UK-wide",postcode:"TA8",lat:51.2800,lng:-2.9700,description:"Charity providing grants of £250–£1,000 to disabled children and young people across the UK towards specialist equipment — wheelchairs, adapted bikes and trikes, and sensory toys. Also runs a respite holiday home in Somerset.",ageMin:0,ageMax:18,accessibility:["Grants — remote application"],support:"Grant applications",needs:["Physical disability","Learning disability","Autism","Cerebral palsy","Sensory processing","Multiple disabilities"],cost:"Grants £250–£1,000",funding:["Charity grants available"],days:["Monday","Tuesday","Wednesday","Thursday","Friday"],time:"Apply online — see website",contactName:"CrackerJacks Children's Trust",contactEmail:"Contact via website",contactPhone:"Contact via website",website:"https://www.crackerjackstrust.co.uk",factChecked:false,ownerId:"seed"},

  {id:"sx-act-1",name:"Active Autism Football",organisation:"Fulham FC Foundation",type:"Sports",location:"Kingston upon Thames",postcode:"KT2",lat:51.4100,lng:-0.2800,description:"Weekly football sessions for children and teenagers on the autism spectrum, run by Fulham FC Foundation at St Joseph's School, Kingston upon Thames. Fun, structured coaching in a supportive, low-pressure environment.",ageMin:5,ageMax:16,accessibility:["Quiet approach","Visual structure"],support:"Specialist coaches",needs:["Autism","ADHD","Communication difficulties","Sensory processing"],cost:"Contact for pricing",funding:["Self-pay"],days:["Saturday"],time:"Weekly — see website",contactName:"Ashley Gumbrell",contactEmail:"agumbrell@fulhamfc.com",contactPhone:"Contact via email",website:"https://www.fulhamfc.com/foundation",factChecked:false,ownerId:"seed"},
  {id:"sx-act-2",name:"Conquest Art — Inclusive Art Groups",organisation:"Conquest Art",type:"Arts & Crafts",location:"Epsom, Kingston & Cheam",postcode:"KT18",lat:51.3360,lng:-0.2670,description:"Friendly art groups for children and adults with disabilities, with sessions across Epsom, Worcester Park, Cheam and Kingston. Adapted materials and one-to-one encouragement help everyone create and build confidence through art.",ageMin:5,ageMax:99,accessibility:["Wheelchair accessible","Step-free access","Adapted materials"],support:"Volunteer support",needs:["Physical disability","Learning disability","Autism","Communication difficulties","Sensory processing"],cost:"Contact for pricing",funding:["Charity grants available","Self-pay"],days:["Various"],time:"See website for group times",contactName:"Conquest Art",contactEmail:"Contact via website",contactPhone:"Contact via website",website:"https://www.conquestart.org",factChecked:false,ownerId:"seed"},
  {id:"sx-act-3",name:"Buds@Express Autism Play & Social Clubs",organisation:"Express CIC",type:"Social Skills",location:"Kingston upon Thames",postcode:"KT1",lat:51.4100,lng:-0.3060,description:"Kingston-based community organisation offering support groups, social clubs, events and counselling linked to autism, including Buds@Express — a structured parent-and-child group for autistic preschoolers based on the Attention Autism approach.",ageMin:2,ageMax:18,accessibility:["Step-free access","Quiet space","Low-arousal environment"],support:"Specialist-led",needs:["Autism","Communication difficulties","Sensory processing","Global development delay"],cost:"Low-cost — see website",funding:["Charity grants available","Self-pay"],days:["Wednesday"],time:"Term-time sessions — see website",contactName:"Express CIC",contactEmail:"Contact via website",contactPhone:"Contact via website",website:"https://www.expresscic.org.uk",factChecked:false,ownerId:"seed"},

  {id:"sx-ther-1",category:"therapy",name:"Conductive Education & Early Intervention",organisation:"Small Steps",type:"Physiotherapy",location:"Feltham, London (Surrey border)",postcode:"TW13",lat:51.4470,lng:-0.4090,description:"Specialist early-intervention charity for young children with physical disabilities such as cerebral palsy, using conductive education and a multidisciplinary approach (physiotherapy, occupational therapy and conductive education) to help children develop movement, independence and confidence.",ageMin:0,ageMax:8,cost:"Contact — part-funded places available",contactEmail:"Contact via website",website:"https://small-steps.org.uk",needs:["Cerebral palsy","Physical disability","Global development delay","Multiple disabilities"],accessibility:["Wheelchair accessible","Hoist available","Step-free access"],support:"Multidisciplinary",days:["Weekdays"],funding:["Charity grants available"],factChecked:false,ownerId:"seed"},

  {id:"sx-char-1",category:"charity",name:"interAKtive — Surrey Autism Family Charity",organisation:"interAKtive",type:"Social Skills",location:"Surrey-wide",postcode:"KT22",lat:51.2950,lng:-0.3300,description:"Surrey-based parent-led charity for families who have a child on the autism spectrum or with similar communication difficulties. Offers peer support, information, social activities and events for families across the county.",ageMin:0,ageMax:25,accessibility:["Events vary by venue"],support:"Parent-led peer support",needs:["Autism","Communication difficulties","ADHD","Sensory processing"],cost:"Free — charity services",funding:["Fully funded","Charity grants available"],days:["Various"],time:"Events — see website",contactName:"interAKtive",contactEmail:"info@interaktive.org.uk",contactPhone:"Contact via website",website:"https://www.interaktive.org.uk",factChecked:false,ownerId:"seed"},
  {id:"sx-char-2",category:"charity",name:"Ruils — Disability Support & Activities",organisation:"Ruils",type:"Social Skills",location:"Teddington / Richmond",postcode:"TW11",lat:51.4260,lng:-0.3320,description:"Local charity supporting children and adults with disabilities to live independently and be part of their community. Provides information, advice, befriending and inclusive activities across Richmond and neighbouring areas bordering Surrey.",ageMin:0,ageMax:99,accessibility:["Wheelchair accessible","Step-free access"],support:"Advice & befriending",needs:["Physical disability","Learning disability","Autism","Communication difficulties","Multiple disabilities"],cost:"Free — charity services",funding:["Charity grants available","Fully funded"],days:["Monday","Tuesday","Wednesday","Thursday","Friday"],time:"See website",contactName:"Ruils",contactEmail:"Contact via website",contactPhone:"Contact via website",website:"https://www.ruils.co.uk",factChecked:false,ownerId:"seed"},
  {id:"sx-char-3",category:"charity",name:"NAS Sutton Branch",organisation:"National Autistic Society — Sutton Branch",type:"Social Skills",location:"Sutton",postcode:"SM1",lat:51.3620,lng:-0.1940,description:"Local National Autistic Society branch serving autistic children, young people and families in and around Sutton. Runs information sharing, parent support and signposting to local autism-friendly activities and services.",ageMin:0,ageMax:25,accessibility:["Events vary by venue"],support:"Branch volunteers",needs:["Autism","ADHD","Communication difficulties","Sensory processing","Learning disability"],cost:"Free — charity services",funding:["Fully funded","Charity grants available"],days:["Various"],time:"See website",contactName:"NAS Sutton Branch",contactEmail:"Contact via website",contactPhone:"Contact via website",website:"https://www.nassutton.org.uk",factChecked:false,ownerId:"seed"},

  {id:"sx-hol-1",category:"activity",name:"Together — SEND Holiday Drama Club",organisation:"Guildford Shakespeare Company",type:"Drama",location:"Guildford",postcode:"GU1",lat:51.2362,lng:-0.5704,description:"Free holiday drama club for children and young people aged 12–25 with SEND, run by professional facilitators as part of GSC's Well-Being Weeks. Explore stories, rehearse scenes, play drama games and make props and masks. Rehearsal spaces are wheelchair friendly. Runs during school holidays — contact Creative Learning Producer Kerrie for current dates. Website: guildford-shakespeare-company.co.uk",ageMin:12,ageMax:25,accessibility:["Wheelchair accessible","Step-free access"],support:"Group with facilitators",needs:["Autism","Learning disability","ADHD","Anxiety","Communication difficulties"],cost:"Free",funding:["Fully funded"],days:["Holiday club — dates vary"],time:"Typically 10:30am–2:30pm during school holidays",contactName:"Kerrie — Creative Learning Producer",contactEmail:"Contact via website",contactPhone:"01483 301590",website:"https://www.guildford-shakespeare-company.co.uk/wellbeingweeks/",factChecked:false,ownerId:"seed"},

  {id:"sx-hol-2",category:"therapy",name:"Elysian Farm Sessions & Holiday Camps",organisation:"Elysian Animal Assisted Therapy and Learning",type:"Animal Therapy",location:"Shamley Green, Guildford",postcode:"GU5 0TL",lat:51.1660,lng:-0.4880,description:"Farm-based animal-assisted therapy and holiday sessions for children and young people aged 10–18 with additional needs, including a strong focus on supporting Pathological Demand Avoidance (PDA) profiles. Sites in Shamley Green (Guildford), West Horsley and Liss (Hampshire). Outside term time, evenings and weekends, Elysian runs farm camps and bespoke sessions for individuals and groups. Contact for current holiday camp dates and pricing. Website: elysianuk.org",ageMin:10,ageMax:18,accessibility:["Rural site — contact about access"],support:"Small group / 1:1 available",needs:["Autism","Anxiety","Sensory processing","Learning disability","Communication difficulties"],cost:"Contact for pricing",funding:["Self-pay","Contact re funding options"],days:["Holiday club — dates vary"],time:"School holidays, evenings & weekends",contactName:"Elysian",contactEmail:"admin@elysianuk.org",contactPhone:"07944 875155",website:"https://elysianuk.org",factChecked:false,ownerId:"seed"},

  {id:"sx-hol-3",category:"activity",name:"ParaSports Coaching Holiday Camps — Farnham",organisation:"ParaSports Coaching",type:"Sports",location:"Farnham",postcode:"GU9 9EL",lat:51.2150,lng:-0.7990,description:"Holiday camps and activity days for children with additional needs, run by experienced SEN staff. Sports, arts, Lego, outdoor and sensory play to build socialising and confidence in a safe environment. Runs in every school holiday, primarily at Weybourne Village Hall, Farnham (venue may vary by camp — check booking page). Some sessions may be HAF-eligible for families on benefit-related free school meals — contact to check current funding options. Website: parasportscoaching.com",ageMin:5,ageMax:14,accessibility:["SEN-trained staff","Contact venue about access"],support:"SEN-specific group support",needs:["Autism","ADHD","Learning disability","Sensory processing"],cost:"From £130 for a 3-day camp (private); HAF-funded places may be available — contact to check",funding:["Self-pay","HAF funded (check eligibility)"],days:["Holiday club — dates vary"],time:"School holidays — see website for current dates",contactName:"ParaSports Coaching",contactEmail:"parasportscoaching@gmail.com",contactPhone:"07843 819110",website:"https://www.parasportscoaching.com",factChecked:false,ownerId:"seed"},

  {id:"sx-hol-4",category:"activity",name:"Nower Wood Holiday Club — Forest School",organisation:"Surrey Wildlife Trust",type:"Nature",location:"Nower Wood, near Leatherhead",postcode:"KT22",lat:51.2550,lng:-0.2950,description:"Forest School holiday club for children aged 5–11 at Nower Wood Educational Nature Reserve (off J9 of the M25, near Leatherhead). The fully accessible centre has a raised pond and minibeast habitat for wheelchair users, an accessible woodland trail and Changing Places toilets. Half-term days (confirmed running for 2026, e.g. the Easter Wild Explorers club on 7 & 9 April 2026) include pond dipping, minibeast hunting and den building; the summer programme is normally three 3-day weeks (Tue–Thu). Additional needs are welcomed — if your child needs 1:1 support, an accompanying adult is required, so please contact the team before booking to discuss how best to support your child. Website: surreywildlifetrust.org",ageMin:5,ageMax:11,accessibility:["Wheelchair accessible","Step-free access","Changing Places toilet","Accessible woodland trail","Carer/1:1 may need to attend"],support:"Discuss needs before booking",needs:["Autism","ADHD","Sensory processing","Learning disability"],cost:"Paid — see website for current prices",funding:["Self-pay"],days:["Holiday club — dates vary"],time:"School holidays — half-terms & summer (3-day weeks, Tue–Thu) — book via Eventbrite",contactName:"Surrey Wildlife Trust — Education Centres",contactEmail:"education.centres@surreywt.org.uk",contactPhone:"01372 379509",website:"https://www.surreywildlifetrust.org/things-do/holiday-clubs",factChecked:false,ownerId:"seed"},

  {id:"sx-hol-5",category:"activity",name:"NAS Surrey Autism Youth Club — Godalming",organisation:"National Autistic Society — Surrey Service",type:"Social Skills",location:"Godalming",postcode:"GU7",lat:51.1850,lng:-0.6120,description:"Weekly autism-friendly youth club for autistic young people aged 11–18 who live in Surrey, run by NAS Surrey Service professionals (distinct from the volunteer-run NAS Surrey Branch). A safe, structured environment with a wide variety of fun activities to build communication, social skills, confidence and independence — everyone gets time to meet new friends, learn and play. Meets Tuesdays 7–9pm during term-time. Apply via a self-referral form. Website: nassurreybranch.org",ageMin:11,ageMax:18,accessibility:["Autism-friendly structured environment"],support:"Staff-led small group",needs:["Autism","Communication difficulties","Anxiety"],cost:"£5 per session (£2.50 for families on income support, or for second siblings)",funding:["Self-pay","Concessions available"],days:["Tuesday"],time:"7:00pm–9:00pm, term-time only",contactName:"NAS Surrey Family Support Service",contactEmail:"surrey.familysupport@nas.org.uk",contactPhone:"01483 521 743",website:"https://nassurreybranch.org/nas-clubs-for-children/",factChecked:false,ownerId:"seed"},
];

const ACTIVITY_TYPES = ["All Types","Swimming","Arts & Crafts","Animal Therapy","Music","Sports","Drama","Cooking","Nature","Dance","Technology","Therapy","Social Skills","Sensory"];

const THERAPY_CATEGORIES = [
  { id:"All",     label:"All Therapies", keywords:[] },
  { id:"DMI",     label:"DMI",           keywords:["dmi","dynamic movement"] },
  { id:"CE",      label:"Conductive Ed", keywords:["conductive education"] },
  { id:"Physio",  label:"Neuro / Physio",keywords:["physiotherapy","physio"] },
  { id:"OT",      label:"OT & Sensory",  keywords:["occupational therapy","sensory integration"] },
  { id:"SLT",     label:"Speech & Language", keywords:["speech","language therapy"] },
  { id:"Hydro",   label:"Hydrotherapy",  keywords:["hydrotherapy","aquatic therapy","halliwick"] },
  { id:"Music",   label:"Music Therapy", keywords:["music therapy"] },
  { id:"Art",     label:"Art / Drama",   keywords:["art therapy","drama therapy","dramatherapy","arts therapies","creative therapies"] },
  { id:"Play",    label:"Play Therapy",  keywords:["play therapy"] },
  { id:"Bobath",  label:"Bobath / MAES", keywords:["bobath","maes","targeted training"] },
  { id:"Rebound", label:"Rebound",       keywords:["rebound therapy"] },
];
const NEEDS_LIST = ["Autism","ADHD","Physical disability","Sensory processing","Learning disability","Cerebral palsy","Down's syndrome","Anxiety","Communication difficulties","Hearing impairment","Visual impairment","Global development delay"];
const DAYS_LIST = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
// Grant / funding options families can filter charities by
const FUNDING_OPTS = ["Charity grants available","Short Breaks funded","EHCP funded","Direct Payments accepted","Self-pay","NHS funded"];
// Types of support a charity offers — derived from each charity's described services
const CHARITY_SUPPORT = [
  {label:"Helpline & advice",       kw:["helpline","advice","information","guidance","signpost"]},
  {label:"Family & carer support",  kw:["family support","families","parent","carer","sibling"]},
  {label:"Grants & financial help", kw:["grant","financial","bursary","hardship","fund for"]},
  {label:"Clubs & activities",      kw:["youth club","clubs","activities","leisure","play","groups","social"]},
  {label:"Respite & short breaks",  kw:["respite","short break","short-break","sitting service"]},
  {label:"Employment support",      kw:["employment","supported work","job","into work"]},
  {label:"Education & schools",     kw:["school","education","sen support","tuition"]},
  {label:"Advocacy & rights",       kw:["advocacy","advocate","campaign","rights","equal","tribunal"]},
  {label:"Diagnosis & assessment",  kw:["diagnosis","assessment","diagnostic"]},
  {label:"Equipment & resources",   kw:["equipment","resources","aids","sensory kit","wheelchair loan"]},
  {label:"Counselling & wellbeing", kw:["counselling","wellbeing","mental health","emotional support","therapy"]},
];
function charitySupportTags(a){
  const hay=((a.name||"")+" "+(a.description||"")+" "+(a.type||"")+" "+((a.needs||[]).join(" "))).toLowerCase();
  return CHARITY_SUPPORT.filter(s=>s.kw.some(k=>hay.includes(k))).map(s=>s.label);
}
// Special one-off or annual events only — NOT regular weekly/term-time sessions.
// Each event needs: id, title, org, blurb, url, cta, lat, lng, area, emoji, img.
// img: set a specific image URL per event; falls back to blue gradient + emoji if it fails to load.
// ⚠️ Only add events with a confirmed date from the provider's own website.
const EVENTS = [
  {
    id:"wheelpower-mx-2026",
    title:"Middlesex WheelPower Sports Festival",
    org:"WheelPower",
    blurb:"Adaptive sports taster day — disabled people aged 5+ discover wheelchair sport & physical activity.",
    url:"https://www.wheelpower.org.uk/activities/london-sports-festival/",
    cta:"Event details →",
    lat:51.5520, lng:-0.2700, area:"Middlesex / NW London",
    emoji:"🏅",
    img:"https://images.unsplash.com/photo-1576633587382-13ddf37b1fc1?w=240&h=240&fit=crop",
  },
  {
    id:"h2h-musical-theatre-jul26",
    title:"Head2Head Musical Theatre Workshop",
    org:"Head2Head Sensory Theatre",
    blurb:"Five-day musical theatre workshop near Oxted, Surrey for teens & adults with SEND — acting, singing, dance, final performance. 27–31 July 2026.",
    url:"https://h2hsensorytheatre.com/inclusive-summer-theatre-workshops-return-to-surrey-for-children-and-young-people-with-send/",
    cta:"Book tickets →",
    lat:51.1520, lng:-0.0200, area:"Oxted, Surrey",
    emoji:"🎭",
    img:"https://images.unsplash.com/photo-1503095396549-807759245b35?w=240&h=240&fit=crop",
  },
  {
    id:"h2h-theatre-play-aug26",
    title:"Head2Head Theatre Play Workshop",
    org:"Head2Head Sensory Theatre",
    blurb:"Three-day theatre workshop for children ages 6–11 with SEND, introducing theatre through games, storytelling and creative play. 24–26 August 2026.",
    url:"https://h2hsensorytheatre.com/inclusive-summer-theatre-workshops-return-to-surrey-for-children-and-young-people-with-send/",
    cta:"Book tickets →",
    lat:51.1520, lng:-0.0200, area:"Oxted, Surrey",
    emoji:"🌟",
    img:"https://images.unsplash.com/photo-1544928147-79a2dbc1f389?w=240&h=240&fit=crop",
  },
  {
    id:"h2h-storytelling-aug26",
    title:"Head2Head Collaborative Storytelling",
    org:"Head2Head Sensory Theatre",
    blurb:"Two-day storytelling workshop for teens & adults with SEND — create and perform an original piece together. 27–28 August 2026.",
    url:"https://h2hsensorytheatre.com/inclusive-summer-theatre-workshops-return-to-surrey-for-children-and-young-people-with-send/",
    cta:"Book tickets →",
    lat:51.1520, lng:-0.0200, area:"Oxted, Surrey",
    emoji:"📖",
    img:"https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=240&h=240&fit=crop",
  },
  {
    id:"linkable-inclusive-games-26",
    title:"LinkAble Inclusive Games 2026",
    org:"LinkAble",
    blurb:"All-abilities sports day in Woking — boccia, table cricket, accessible cycling & walking football. Open to all ages. 25 August 2026.",
    url:"https://www.linkable.org.uk/events",
    cta:"Get tickets →",
    lat:51.3100, lng:-0.5350, area:"Woking, Surrey",
    emoji:"🏆",
    img:"https://images.unsplash.com/photo-1569517282132-25d22f4573e6?w=240&h=240&fit=crop",
  },
];
const ACCESS_LIST = ["Wheelchair accessible","Changing Places toilet","Hoist available","Quiet space","Visual timetables","Ear defenders available","Step-free access","Induction loop","BSL interpreter","Sensory room","Low-arousal environment","Mounting ramp"];
const FUNDING_LIST = ["Fully funded","Short Breaks funded","EHCP funded","DLA accepted","Bursary available","Charity grants available","Self-pay"];

// ─── UK locations ─────────────────────────────────────────────────────────────
const UK_LOCATIONS = {
  "London":[51.5074,-0.1278],"Manchester":[53.4808,-2.2426],"Birmingham":[52.4862,-1.8904],"Leeds":[53.8008,-1.5491],"Sheffield":[53.3811,-1.4701],"Bristol":[51.4545,-2.5879],"Liverpool":[53.4084,-2.9916],"Edinburgh":[55.9533,-3.1883],"Glasgow":[55.8642,-4.2518],"Newcastle":[54.9783,-1.6178],"Nottingham":[52.9548,-1.1581],"Leicester":[52.6369,-1.1398],"Coventry":[52.4068,-1.5197],"Bradford":[53.7960,-1.7594],"Cardiff":[51.4816,-3.1791],"Belfast":[54.5973,-5.9301],"Southampton":[50.9097,-1.4044],"Portsmouth":[50.8198,-1.0880],"Oxford":[51.7520,-1.2577],"Cambridge":[52.2053,0.1218],"Brighton":[50.8229,-0.1363],"Reading":[51.4543,-0.9781],"Plymouth":[50.3755,-4.1427],"Exeter":[50.7184,-3.5339],"Norwich":[52.6309,1.2974],"Derby":[52.9225,-1.4746],"Stoke":[53.0027,-2.1794],"Wolverhampton":[52.5862,-2.1272],"Sunderland":[54.9061,-1.3816],"Swansea":[51.6214,-3.9436],"York":[53.9600,-1.0873],"Peterborough":[52.5695,-0.2405],"Luton":[51.8787,-0.4200],"Northampton":[52.2405,-0.9027],"Milton Keynes":[52.0406,-0.7594],"Bath":[51.3811,-2.3590],"Cheltenham":[51.8994,-2.0783],"Gloucester":[51.8642,-2.2440],"Worcester":[52.1920,-2.2200],"Hereford":[52.0565,-2.7160],"Shrewsbury":[52.7080,-2.7540],"Chester":[53.1905,-2.8910],"Carlisle":[54.8951,-2.9382],"Lancaster":[54.0465,-2.8007],"Preston":[53.7632,-2.7031],"Blackpool":[53.8175,-3.0357],"Bolton":[53.5779,-2.4283],"Wigan":[53.5450,-2.6325],"Rochdale":[53.6136,-2.1614],"Oldham":[53.5409,-2.1114],"Salford":[53.4875,-2.2901],"Stockport":[53.4106,-2.1575],"Warrington":[53.3900,-2.5970],"Huddersfield":[53.6458,-1.7850],"Halifax":[53.7247,-1.8658],"Wakefield":[53.6830,-1.4977],"Barnsley":[53.5526,-1.4797],"Rotherham":[53.4300,-1.3570],"Doncaster":[53.5228,-1.1286],"Hull":[53.7457,-0.3367],"Grimsby":[53.5676,-0.0798],"Lincoln":[53.2307,-0.5406],"Middlesbrough":[54.5742,-1.2350],"Gateshead":[54.9581,-1.6022],"Durham":[54.7753,-1.5849],"Harrogate":[53.9919,-1.5378],"Blackburn":[53.7480,-2.4820],"Burnley":[53.7893,-2.2376],"Bury":[53.5933,-2.2980],"Swindon":[51.5558,-1.7797],"Slough":[51.5105,-0.5950],"Guildford":[51.2362,-0.5704],"Woking":[51.3168,-0.5600],"Crawley":[51.1092,-0.1872],"Maidstone":[51.2720,0.5290],"Canterbury":[51.2802,1.0789],"Dover":[51.1295,1.3089],"Eastbourne":[50.7684,0.2840],"Worthing":[50.8190,-0.3730],"Chichester":[50.8365,-0.7792],"Basingstoke":[51.2665,-1.0872],"Winchester":[51.0632,-1.3080],"Bournemouth":[50.7192,-1.8808],"Poole":[50.7153,-1.9870],"Salisbury":[51.0693,-1.7944],"Taunton":[51.0153,-3.1010],"Yeovil":[50.9452,-2.6370],"Torquay":[50.4619,-3.5253],"Truro":[50.2632,-5.0510],"Inverness":[57.4778,-4.2247],"Aberdeen":[57.1497,-2.0943],"Dundee":[56.4620,-2.9707],"Stirling":[56.1165,-3.9369],"Walsall":[52.5860,-1.9820],"Telford":[52.6766,-2.4469],"Aldershot":[51.2480,-0.7620],"Camberley":[51.3360,-0.7436],"Farnham":[51.2149,-0.7990],"Aylesbury":[51.8151,-0.8093],"High Wycombe":[51.6287,-0.7482],"Windsor":[51.4839,-0.6044],"Croydon":[51.3762,-0.0982],"Bromley":[51.4064,0.0139],"Dartford":[51.4462,0.2177],"Colchester":[51.8959,0.8919],"Ipswich":[52.0567,1.1482],"Chelmsford":[51.7361,0.4798],"Southend":[51.5362,0.7146],"Stevenage":[51.9022,-0.2019],"Watford":[51.6565,-0.3960],"St Albans":[51.7526,-0.3360],"Hemel Hempstead":[51.7538,-0.4530],"Harlow":[51.7779,0.1434],
  "AB":[57.1497,-2.0943],"AL":[51.7526,-0.3360],"B":[52.4862,-1.8904],"BA":[51.3811,-2.3590],"BB":[53.7480,-2.4820],"BD":[53.7960,-1.7594],"BH":[50.7192,-1.8808],"BL":[53.5779,-2.4283],"BN":[50.8229,-0.1363],"BR":[51.4064,0.0139],"BS":[51.4545,-2.5879],"CA":[54.8951,-2.9382],"CB":[52.2053,0.1218],"CF":[51.4816,-3.1791],"CH":[53.1905,-2.8910],"CM":[51.7361,0.4798],"CO":[51.8959,0.8919],"CR":[51.3762,-0.0982],"CT":[51.2802,1.0789],"CV":[52.4068,-1.5197],"CW":[53.0900,-2.4430],"DA":[51.4462,0.2177],"DD":[56.4620,-2.9707],"DE":[52.9225,-1.4746],"DH":[54.7753,-1.5849],"DL":[54.5225,-1.5560],"DN":[53.5228,-1.1286],"DT":[50.7153,-2.4400],"DY":[52.5126,-2.0810],"E":[51.5174,-0.0722],"EC":[51.5155,-0.0922],"EH":[55.9533,-3.1883],"EN":[51.6520,-0.0820],"EX":[50.7184,-3.5339],"FK":[56.0020,-3.7830],"FY":[53.8175,-3.0357],"G":[55.8642,-4.2518],"GL":[51.8642,-2.2440],"GU":[51.2362,-0.5704],"HA":[51.5795,-0.3350],"HD":[53.6458,-1.7850],"HG":[53.9919,-1.5378],"HP":[51.7538,-0.4530],"HR":[52.0565,-2.7160],"HU":[53.7457,-0.3367],"HX":[53.7247,-1.8658],"IG":[51.5590,0.0750],"IP":[52.0567,1.1482],"IV":[57.4778,-4.2247],"KA":[55.6130,-4.4960],"KT":[51.3700,-0.4560],"KW":[58.4430,-3.0970],"KY":[56.3950,-3.4312],"L":[53.4084,-2.9916],"LA":[54.0465,-2.8007],"LD":[52.2420,-3.3780],"LE":[52.6369,-1.1398],"LL":[53.0452,-2.9940],"LN":[53.2307,-0.5406],"LS":[53.8008,-1.5491],"LU":[51.8787,-0.4200],"M":[53.4808,-2.2426],"ME":[51.3860,0.5052],"MK":[52.0406,-0.7594],"ML":[55.7740,-3.9850],"N":[51.5770,-0.1030],"NE":[54.9783,-1.6178],"NG":[52.9548,-1.1581],"NN":[52.2405,-0.9027],"NP":[51.5882,-2.9977],"NR":[52.6309,1.2974],"NW":[51.5450,-0.1430],"OL":[53.5409,-2.1114],"OX":[51.7520,-1.2577],"PA":[55.8451,-4.4234],"PE":[52.5695,-0.2405],"PH":[56.3950,-3.4312],"PL":[50.3755,-4.1427],"PO":[50.8198,-1.0880],"PR":[53.7632,-2.7031],"RG":[51.4543,-0.9781],"RH":[51.1092,-0.1872],"RM":[51.5590,0.1830],"S":[53.3811,-1.4701],"SA":[51.6214,-3.9436],"SE":[51.4874,-0.0560],"SG":[51.9022,-0.2019],"SK":[53.4106,-2.1575],"SL":[51.5105,-0.5950],"SM":[51.3617,-0.1947],"SN":[51.5558,-1.7797],"SO":[50.9097,-1.4044],"SP":[51.0693,-1.7944],"SR":[54.9061,-1.3816],"SS":[51.5362,0.7146],"ST":[52.8073,-2.1170],"SW":[51.4874,-0.1560],"SY":[52.7080,-2.7540],"TA":[51.0153,-3.1010],"TD":[55.6490,-2.7840],"TF":[52.6766,-2.4469],"TN":[51.1323,0.2630],"TQ":[50.4619,-3.5253],"TR":[50.2632,-5.0510],"TS":[54.5742,-1.2350],"TW":[51.4479,-0.3260],"UB":[51.5340,-0.4760],"W":[51.5130,-0.1590],"WA":[53.3900,-2.5970],"WC":[51.5155,-0.1200],"WD":[51.6565,-0.3960],"WF":[53.6830,-1.4977],"WN":[53.5450,-2.6325],"WR":[52.1920,-2.2200],"WS":[52.5860,-1.9820],"WV":[52.5862,-2.1272],"YO":[53.9600,-1.0873],"ZE":[60.1540,-1.1450],
  "GU1":[51.2362,-0.5704],"GU2":[51.2443,-0.5878],"GU3":[51.2080,-0.6210],"GU4":[51.2280,-0.5240],"GU7":[51.1866,-0.6038],"GU9":[51.2149,-0.7990],"GU11":[51.2480,-0.7620],"GU12":[51.2490,-0.7450],"GU14":[51.2960,-0.7560],"GU15":[51.3360,-0.7436],"GU16":[51.3060,-0.7290],"GU21":[51.3330,-0.5550],"GU22":[51.3168,-0.5600],"GU23":[51.3200,-0.5000],"GU24":[51.3380,-0.6200],"GU25":[51.3890,-0.5560],
};

function resolveLocation(raw) {
  const input = raw.trim();
  if (!input) return null;
  const stripped = input.replace(/\s+/g,"").toUpperCase();
  const lower = input.toLowerCase();
  const fullPcMatch = stripped.match(/^([A-Z]{1,2}\d{1,2}[A-Z]?)\d[A-Z]{2}$/);
  if (fullPcMatch) {
    const outward = fullPcMatch[1];
    if (UK_LOCATIONS[outward]) return { lat:UK_LOCATIONS[outward][0], lng:UK_LOCATIONS[outward][1], label:formatPostcode(input)+" area" };
    const areaCode = outward.match(/^[A-Z]{1,2}/)[0];
    if (UK_LOCATIONS[areaCode]) return { lat:UK_LOCATIONS[areaCode][0], lng:UK_LOCATIONS[areaCode][1], label:formatPostcode(input)+" area" };
  }
  if (UK_LOCATIONS[stripped]) return { lat:UK_LOCATIONS[stripped][0], lng:UK_LOCATIONS[stripped][1], label:stripped+" area" };
  const exact = Object.entries(UK_LOCATIONS).find(([n])=>n.toLowerCase()===lower);
  if (exact) return { lat:exact[1][0], lng:exact[1][1], label:exact[0] };
  const prefix = Object.entries(UK_LOCATIONS).find(([n])=>n.toLowerCase().startsWith(lower)&&n.length>2);
  if (prefix) return { lat:prefix[1][0], lng:prefix[1][1], label:prefix[0] };
  return null;
}

function haversine(lat1,lng1,lat2,lng2){const R=6371,dLat=(lat2-lat1)*Math.PI/180,dLng=(lng2-lng1)*Math.PI/180,a=Math.sin(dLat/2)**2+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));}

// Instantly activates Verified/Featured for a listing the caller owns. Tries
// the secure server function first (netlify/functions/activate-tier.js —
// this is where Stripe will plug in later); if that's not deployed yet (e.g.
// running this as a preview artifact, or before the function is live) it
// falls back to updating the listing directly so the flow still works for
// development/demo purposes. Once the function IS deployed, it's used
// automatically — nothing else needs to change.
async function activateTier(act,tier){
  try{
    const{data:{session}}=await sb.auth.getSession();
    if(session?.access_token){
      const res=await fetch(`${API_BASE}/.netlify/functions/activate-tier`,{
        method:"POST",
        headers:{"Content-Type":"application/json",Authorization:`Bearer ${session.access_token}`},
        body:JSON.stringify({actId:act.id,tier})
      });
      if(res.ok){const{activity}=await res.json();return activity;}
    }
  }catch{ /* function not deployed/reachable — fall through to local activation below */ }
  const updated=tier==="featured"?{...act,featured:true,verifiedPaid:true,verified:true}:{...act,verifiedPaid:true,verified:true};
  try{ await store.set(`activity:${act.id}`,updated); }catch{}
  return updated;
}

// Starts a REAL Stripe payment for Verified/Featured: redirects the whole
// page to Stripe's hosted checkout. Activation itself happens server-side in
// netlify/functions/stripe-webhook.js once Stripe confirms the card was
// actually charged — never on the client, since the browser can't be
// trusted to honestly report "yes I paid." If the checkout-session function
// isn't deployed/configured yet (no STRIPE_SECRET_KEY set), this throws so
// the calling modal can fall back to instant free activation for
// development/demo purposes — same fallback pattern as activateTier above.
async function startTierCheckout(act,tier){
  const{data:{session}}=await sb.auth.getSession();
  if(!session?.access_token)throw new Error("Not signed in");
  const res=await fetch(`${API_BASE}/.netlify/functions/create-checkout-session`,{
    method:"POST",
    headers:{"Content-Type":"application/json",Authorization:`Bearer ${session.access_token}`},
    body:JSON.stringify({actId:act.id,tier})
  });
  if(!res.ok){const body=await res.json().catch(()=>({}));throw new Error(body.error||"Couldn't start checkout");}
  const{url}=await res.json();
  if(!url)throw new Error("No checkout URL returned");
  window.location.href=url; // full-page redirect to Stripe — never returns
}

// Used by both GetVerifiedModal and FeaturedUpgradeModal: tries real Stripe
// payment first; only falls back to instant free activation (via the
// onActivated prop, ultimately activateTier above) if the checkout function
// itself is unreachable — e.g. this is running as an offline preview
// artifact with no Netlify functions runtime at all. If Stripe IS deployed
// but returns a real error (misconfigured key, expired session, etc.), that
// error is surfaced instead of silently granting the paid tier for free —
// distinguishing "feature doesn't exist here" from "feature is broken" matters.
async function attemptCheckoutOrFallback(act,tier,onActivated){
  try{
    await startTierCheckout(act,tier); // redirects the page to Stripe — only returns if it throws
    return{redirecting:true};
  }catch(e){
    if(e instanceof TypeError){
      // Network-level failure — the endpoint doesn't exist to even respond
      // (preview/demo context). Fall back to instant free activation.
      await onActivated?.(act);
      return{redirecting:false};
    }
    throw e; // a real error response — let the caller show it
  }
}
function fmtDist(km){const m=km*0.621371;return m<1?`${Math.round(m*10)/10} mi`:`${Math.round(m)} mi`;}
function formatPostcode(raw){const s=raw.toUpperCase().replace(/\s+/g,"");const m=s.match(/^([A-Z]{1,2}\d[A-Z\d]?)(\d[A-Z]{2})$/);return m?m[1]+" "+m[2]:raw;}
function looksLikePostcode(s){return /^[A-Za-z]{1,2}\d/.test(s.trim());}

// ─── API base URL ───────────────────────────────────────────────────────────
// On the web, relative paths like "/.netlify/functions/x" correctly resolve
// against includeme.uk. But the native app's JS runs from a local bundled
// origin (https://localhost via Capacitor), not includeme.uk — a relative
// fetch() there silently resolves against localhost instead, where nothing
// real exists. If the local server has any SPA fallback, that can even
// return a clean 200 (serving index.html back) with no actual function ever
// running, which is exactly what caused save-fcm-token to appear to succeed
// on-device while never once reaching the real backend. Every function call
// must use this prefix so it always hits the real API regardless of platform.
const API_BASE = (typeof window !== "undefined" && window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform())
  ? "https://includeme.uk"
  : "";

// ─── Key-value store backed by a single Supabase `kv` table ───────────────────
// Public catalogue data (activities, reviews, photo cache) lives here. Private
// per-user data (profile, favourites) lives in Supabase Auth metadata instead.
// ─── Supabase client ──────────────────────────────────────────────────────────
import { createClient } from "@supabase/supabase-js";
const SUPA_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPA_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const HAS_SUPABASE = !!(SUPA_URL && SUPA_KEY && SUPA_URL.startsWith("http"));
const sb = HAS_SUPABASE
  ? createClient(SUPA_URL, SUPA_KEY, {
      auth: {
        // Explicit rather than relying on defaults — persistSession keeps
        // the session in localStorage (survives app restarts), and
        // autoRefreshToken runs the proactive-renewal timer. Neither of
        // these alone is enough on a native app, though: see the
        // visibilitychange handler below for the other half of the fix.
        // detectSessionInUrl stays on (the default) — the password-reset
        // flow (PASSWORD_RECOVERY event) depends on it.
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : { auth: {
      getSession:             async()=>({data:{session:null}}),
      onAuthStateChange:      ()=>({data:{subscription:{unsubscribe:()=>{}}}}),
      signOut:                async()=>{},
      signInWithPassword:     async()=>({data:null,error:{message:"Supabase not configured — add VITE_SUPABASE_URL to your .env"}}),
      signUp:                 async()=>({data:null,error:{message:"Supabase not configured — add VITE_SUPABASE_URL to your .env"}}),
      resetPasswordForEmail:  async()=>({error:null}),
      signInWithOAuth:        async()=>{},
      startAutoRefresh:       async()=>{},
      stopAutoRefresh:        async()=>{},
    }};

if(!HAS_SUPABASE) console.warn("⚠️ Supabase not configured — add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file and rebuild.");

// ─── KV store (Supabase `kv` table, no-op if not configured) ─────────────────
const store = {
  async get(k){
    if(!HAS_SUPABASE)return null;
    try{const{data,error}=await sb.from("kv").select("value").eq("key",k).maybeSingle();
    if(error)return null; return data?.value??null;}catch{return null;}
  },
  async set(k,v){
    if(!HAS_SUPABASE)return false;
    try{const{error}=await sb.from("kv").upsert({key:k,value:v},{onConflict:"key"});return!error;}catch{return false;}
  },
  async del(k){
    if(!HAS_SUPABASE)return false;
    try{const{error}=await sb.from("kv").delete().eq("key",k);return!error;}catch{return false;}
  },
  async list(p){
    if(!HAS_SUPABASE)return[];
    try{const{data,error}=await sb.from("kv").select("key").like("key",`${p}%`);
    if(error||!data)return[];return data.map(r=>r.key);}catch{return[];}
  },
};

// ─── Auth (wraps Supabase Auth) ───────────────────────────────────────────────
const auth={
  async signUp({email,password,name,accountType,orgName}){
    const{data,error}=await sb.auth.signUp({email,password,options:{data:{name,accountType:accountType||"individual",orgName:orgName||""}}});
    if(error)throw new Error(error.message);
    if(data.user){
      const profile={id:data.user.id,email:email.toLowerCase(),name,accountType:accountType||"individual",orgName:orgName||"",createdAt:new Date().toISOString(),favourites:[],filterPresets:[],notifications:{newActivities:true,nearMe:true,weeklySummary:true}};
      await store.set(`user:${email.toLowerCase()}`,profile);
    }
    return{data};
  },
  async signIn({email,password}){
    const{data,error}=await sb.auth.signInWithPassword({email,password});
    if(error)throw new Error(error.message);
    return{data};
  },
  async signOut(){await sb.auth.signOut();},
  async oauth(provider){
    await sb.auth.signInWithOAuth({provider,options:{redirectTo:window.location.origin}});
  },
  async reset(email){
    const{error}=await sb.auth.resetPasswordForEmail(email,{redirectTo:`${window.location.origin}?reset=1`});
    if(error)throw new Error(error.message);
  },
};

// ─── Profile helpers ──────────────────────────────────────────────────────────
// ─── Native app push (FCM via Capacitor) ─────────────────────────────────────
// Runs ONLY inside the installed Android/iOS app (no-ops in the browser, which
// uses web push instead). Registers with Firebase Cloud Messaging, gets a
// device token, and saves it server-side so the push-alerts job can reach this
// device. The @capacitor/push-notifications plugin is loaded dynamically so the
// web build doesn't choke on it. Entirely safe before Firebase is configured —
// if the native plugin or permission isn't available it simply does nothing.
async function registerNativePush(user, loc, locLabel) {
  try {
    // Detect the native runtime. Capacitor injects window.Capacitor.
    const cap = typeof window !== "undefined" ? window.Capacitor : null;
    if (!cap || !cap.isNativePlatform || !cap.isNativePlatform()) {
      console.log("[IncludeMe push] not a native platform — skipping (this is expected in a browser)");
      return;
    }
    console.log("[IncludeMe push] native platform detected, loading plugin…");
    const { PushNotifications } = await import("@capacitor/push-notifications");

    let perm = await PushNotifications.checkPermissions();
    console.log("[IncludeMe push] current permission:", perm.receive);
    if (perm.receive === "prompt") perm = await PushNotifications.requestPermissions();
    console.log("[IncludeMe push] permission after request:", perm.receive);
    if (perm.receive !== "granted") {
      console.log("[IncludeMe push] permission not granted — stopping");
      return;
    }

    console.log("[IncludeMe push] calling register()…");
    await PushNotifications.register();

    PushNotifications.addListener("registration", async (tokenData) => {
      const token = tokenData?.value;
      console.log("[IncludeMe push] registration success, token:", token ? token.slice(0, 12) + "…" : "(empty)");
      if (!token) return;
      try {
        const { data: { session } } = await sb.auth.getSession();
        const res = await fetch(`${API_BASE}/.netlify/functions/save-fcm-token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
          },
          body: JSON.stringify({
            token,
            loc: loc || null,
            locLabel: locLabel || "",
            radius: 20,
            types: { newActivities: true },
          }),
        });
        console.log("[IncludeMe push] save-fcm-token responded:", res.status);
      } catch (e) { console.log("[IncludeMe push] save-fcm-token failed:", e.message); }
    });

    PushNotifications.addListener("registrationError", (err) => {
      console.warn("[IncludeMe push] FCM registration error:", JSON.stringify(err));
    });

    // When a push is tapped, deep-link if it carried a url.
    PushNotifications.addListener("pushNotificationActionPerformed", (action) => {
      const url = action?.notification?.data?.url;
      if (url && typeof window !== "undefined") window.location.href = url;
    });
  } catch (e) {
    // Plugin missing or any failure → web/email paths unaffected either way,
    // but log it so native push failures are diagnosable instead of silent.
    console.log("[IncludeMe push] registerNativePush threw:", e && e.message ? e.message : e);
  }
}

// Families are auto-enrolled in the weekly email digest so they don't have to
// find and fill in a settings form to get value from the app — they can turn
// it off in Notifications settings if they don't want it. The signup day is
// spread across the week (today's day, UTC — matches send-weekly-digest.js's
// own day comparison) rather than defaulting everyone to the same day, so
// sends don't all pile up on one day as the user base grows.
function defaultEmailSub(au,name,loc,locLabel){
  return{
    email:au.email,
    day:new Date().toLocaleDateString("en-GB",{weekday:"long",timeZone:"UTC"}),
    types:{newActivities:true,holidayClubs:true,events:true},
    radius:20,
    loc:loc||null,
    locLabel:locLabel||"",
    userId:au.id,
    name:name||"",
    createdAt:new Date().toISOString(),
  };
}
async function ensureProfile(au){
  if(!au?.email)return{id:au?.id||"anon",email:"",name:"User",accountType:"individual",orgName:"",favourites:[],filterPresets:[],notifications:{newActivities:true,nearMe:true,weeklySummary:true}};
  const existing=await store.get(`user:${au.email}`);
  if(existing){
    // IMPORTANT: always trust the LIVE Supabase Auth id (au.id), never a
    // stored `existing.id` that may be stale. Every RLS policy for private
    // rows (notif_sub:, email_sub:, enquiries:, claim:, reports:) checks
    // `key = 'notif_sub:' || auth.uid()`, so if the app used a stale stored
    // id instead of the real auth.uid(), those writes would silently fail
    // (store.set() swallows errors) with no visible error to the user.
    const profile={id:au.id,email:existing.email,name:existing.name,accountType:existing.accountType||"individual",orgName:existing.orgName||"",favourites:existing.favourites||[],filterPresets:existing.filterPresets||[],notifications:existing.notifications||{newActivities:true,nearMe:false,weeklySummary:false},lastNotifSeen:existing.lastNotifSeen||"",dismissedNotifs:existing.dismissedNotifs||[],savedLoc:existing.savedLoc||null,notifSub:existing.notifSub||null,emailSub:existing.emailSub||null,createdAt:existing.createdAt,blocked:existing.blocked||false};
    // Self-heal: if the stored id was wrong/missing, correct it in the DB now
    // so this account never silently fails a private write again.
    if(existing.id!==au.id){
      store.set(`user:${au.email}`,{...existing,id:au.id}).catch(()=>{});
    }
    // Retroactively auto-enroll existing individual accounts that never set
    // up a weekly email digest (e.g. signed up before this feature existed,
    // or the earlier profile-save bug silently prevented it from saving).
    if(!profile.emailSub&&profile.accountType==="individual"){
      const sub=defaultEmailSub(au,profile.name,profile.savedLoc,profile.savedLocLabel);
      profile.emailSub=sub;
      store.set(`email_sub:${au.id}`,sub).catch(()=>{});
      store.set(`user:${au.email}`,{...existing,id:au.id,emailSub:sub}).catch(()=>{});
    }
    return profile;
  }
  // First login — build profile from Supabase metadata
  const meta=au.user_metadata||{};
  const accountType=meta.accountType||"individual";
  const profile={id:au.id,email:au.email,name:meta.name&&!meta.name.includes("@")?meta.name:"",accountType,orgName:meta.orgName||"",createdAt:new Date().toISOString(),favourites:[],filterPresets:[],notifications:{newActivities:true,nearMe:true,weeklySummary:true}};
  // Auto-enroll new family accounts in the weekly email digest immediately —
  // no separate settings form required. Business/org accounts are left out
  // since the digest is framed around "new activities near you" for families.
  if(accountType==="individual"){
    const sub=defaultEmailSub(au,profile.name);
    profile.emailSub=sub;
    await store.set(`email_sub:${au.id}`,sub).catch(()=>{});
  }
  await store.set(`user:${au.email}`,profile);
  return profile;
}

async function saveProfile(patch){
  try{
    const{data:{session}}=await sb.auth.getSession();
    if(!session?.user?.email)return;
    const current=await store.get(`user:${session.user.email}`)||{};
    await store.set(`user:${session.user.email}`,{...current,...patch});
  }catch(e){console.error("saveProfile",e);}
}

// Right after signInWithPassword/signUp, the Supabase client's internal auth
// lock can briefly be held, which makes the very next sb.from("kv") call inside
// ensureProfile hang indefinitely (never resolves OR rejects) — leaving the
// sign-in button's spinner stuck forever, even though the session itself was
// created successfully (a page refresh then logs the user straight in, since
// getSession() reads the already-stored session without touching the lock).
// Guard with a timeout: if ensureProfile doesn't resolve quickly, fall back to
// a minimal profile built from the auth user object so sign-in always completes.
// The background onAuthStateChange listener will pick up the full profile
// (favourites etc.) once the lock clears.
async function ensureProfileSafe(au,ms=3500){
  const fallback=()=>{
    const meta=au?.user_metadata||{};
    return{id:au?.id||"anon",email:(au?.email||"").toLowerCase(),name:(meta.name&&!meta.name.includes("@"))?meta.name:"",accountType:meta.accountType||"individual",orgName:meta.orgName||"",favourites:[],filterPresets:[],notifications:{newActivities:true,nearMe:true,weeklySummary:true},createdAt:new Date().toISOString()};
  };
  try{
    return await Promise.race([
      ensureProfile(au),
      new Promise((_,reject)=>setTimeout(()=>reject(new Error("profile-timeout")),ms)),
    ]);
  }catch{return fallback();}
}

async function doReset(email,notify){
  try{await auth.reset(email);notify("Password reset email sent — check your inbox.");}
  catch(e){notify(e.message||"Could not send reset email.");}
}


// ─── Icons ────────────────────────────────────────────────────────────────────
const Ic=({d,s=16,c="currentColor",fill="none"})=><svg width={s} height={s} viewBox="0 0 24 24" fill={fill} stroke={c} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"><path d={d}/></svg>;
const Icons={
  search:  ()=><Ic d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>,
  pin:     ()=><Ic d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z M12 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>,
  phone:   ()=><Ic d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.07 1h3a2 2 0 0 1 2 1.72c.128.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6.06 6.06l1.27-1.27a2 2 0 0 1 2.11-.45c.9.361 1.845.583 2.81.65A2 2 0 0 1 21 16.92z"/>,
  mail:    ()=><Ic d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6"/>,
  check:   ()=><Ic d="M20 6L9 17l-5-5" s={14}/>,
  plus:    ()=><Ic d="M12 5v14M5 12h14"/>,
  x:       ()=><Ic d="M18 6L6 18M6 6l12 12" s={14}/>,
  filter:  ()=><Ic d="M3 6h18M6 12h12M10 18h4"/>,
  user:    ()=><Ic d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/>,
  building:()=><Ic d="M3 21h18M3 7l9-4 9 4M4 7v14M20 7v14M9 21v-4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4"/>,
  heart:   ({filled})=><svg width={16} height={16} viewBox="0 0 24 24" fill={filled?"#EF4444":"none"} stroke={filled?"#EF4444":C.slate400} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  accessible: ()=><svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="4.5" r="2"/><circle cx="16" cy="17" r="5"/><path d="M9 7v5l4 2M9 12h5l3.5 6"/></svg>,
  edit:    ()=><Ic d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7 M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>,
  trash:   ()=><Ic d="M3 6h18M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>,
  logout:  ()=><Ic d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9"/>,
  eye:     ()=><Ic d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/>,
  eyeOff:  ()=><Ic d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24 M1 1l22 22"/>,
  settings:()=><Ic d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>,
  child:   ()=><Ic d="M12 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8z M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>,
  save:    ()=><Ic d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z M17 21v-8H7v8 M7 3v5h8"/>,
  bell:    ()=><Ic d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0"/>,
  list:    ()=><Ic d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>,
  map:     ()=><Ic d="M9 20l-5.447-2.724A1 1 0 0 1 3 16.382V5.618a1 1 0 0 1 1.447-.894L9 7m0 13l6-3m-6-10l6-3m0 16l5.447-2.724A1 1 0 0 0 21 16.382V5.618a1 1 0 0 0-1.447-.894L15 7m0 13V7"/>,
  locate:  ()=><Ic d="M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7z M12 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/>,
  chevron: ()=><Ic d="M9 18l6-6-6-6"/>,
  wa: ()=><svg width={16} height={16} viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.38 5.07L2 22l5.08-1.33A9.96 9.96 0 0012 22c5.52 0 10-4.48 10-10S17.52 2 12 2z" fill="#25D366"/><path d="M9.05 7.5c-.16-.38-.34-.39-.5-.4H8c-.17 0-.44.06-.67.32-.23.26-.88.85-.88 2.07 0 1.22.9 2.4 1.03 2.57.12.17 1.74 2.77 4.28 3.77.6.26 1.06.41 1.43.53.6.19 1.14.16 1.57.1.48-.07 1.47-.6 1.68-1.18.2-.58.2-1.08.14-1.18-.06-.1-.23-.16-.48-.28-.25-.12-1.47-.73-1.7-.81-.23-.08-.4-.12-.56.12-.17.24-.64.81-.79.98-.14.16-.29.18-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.38-1.72-.15-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.16-.24.25-.41.08-.16.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.84z" fill="white"/></svg>,
};

// ─── WhatsApp share helper ─────────────────────────────────────────────────────
const waShare=(act)=>{
  const base=typeof window!=="undefined"?window.location.origin:"https://includeme.uk";
  const url=`${base}?id=${act.id}`;
  const text=`🌟 *${act.name}*\n${act.organisation} · ${act.location}\n\n${(act.description||"").slice(0,120)}…\n\nFound on IncludeMe — the UK's SEND activity finder:\n${url}`;
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`,"_blank","noopener");
};

// ─── Shared styles injected once ──────────────────────────────────────────────
const GlobalStyles = () => (
  <style>{`
    *{box-sizing:border-box;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;}
    body{margin:0;background:${C.slate50};color:${C.slate800};font-family:${F.body};}
    h1,h2,h3,h4{font-family:${F.display};letter-spacing:-0.01em;}
    input,select,textarea,button{font-family:${F.body};}
    input::placeholder,textarea::placeholder{color:${C.slate400};}
    input:focus,select:focus,textarea:focus{outline:none;border-color:${C.brand}!important;box-shadow:0 0 0 3px rgba(15,107,92,0.14);}
    a{color:inherit;}
    ::selection{background:${C.brand};color:#fff;}
    ::-webkit-scrollbar{width:8px;height:8px;}
    ::-webkit-scrollbar-track{background:transparent;}
    ::-webkit-scrollbar-thumb{background:${C.slate200};border-radius:99px;}
    ::-webkit-scrollbar-thumb:hover{background:${C.slate300};}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    .card-hover{transition:box-shadow .25s cubic-bezier(.2,.7,.3,1),transform .25s cubic-bezier(.2,.7,.3,1),border-color .25s;}
    .card-hover:hover{box-shadow:${SHADOW.xl};transform:translateY(-5px);}
  `}</style>
);

// ─── Base components ──────────────────────────────────────────────────────────
const Label = ({children,sub})=>(
  <div style={{marginBottom:7}}>
    <label style={{display:"block",fontSize:11,fontWeight:700,color:C.slate500,textTransform:"uppercase",letterSpacing:"0.1em"}}>{children}</label>
    {sub&&<span style={{fontSize:12,color:C.slate400,fontWeight:400}}>{sub}</span>}
  </div>
);

const Field = ({label,sub,children})=>(
  <div style={{marginBottom:18}}>
    {label&&<Label sub={sub}>{label}</Label>}
    {children}
  </div>
);

const inputStyle = {
  width:"100%",padding:"11px 13px",border:`1.5px solid ${C.slate200}`,borderRadius:10,
  fontSize:14,color:C.slate800,background:C.white,transition:"border-color 0.15s,box-shadow 0.15s",
};

const Input=({label,sub,...props})=>(
  <Field label={label} sub={sub}>
    <input style={inputStyle} {...props}/>
  </Field>
);

const Textarea=({label,...props})=>(
  <Field label={label}>
    <textarea style={{...inputStyle,minHeight:88,resize:"vertical",lineHeight:1.6}} {...props}/>
  </Field>
);

const Select=({label,options,...props})=>(
  <Field label={label}>
    <select style={{...inputStyle,cursor:"pointer"}} {...props}>
      {options.map(o=><option key={o}>{o}</option>)}
    </select>
  </Field>
);

const Btn=({children,variant="primary",size="md",full,loading,...props})=>{
  const v={
    primary:{bg:C.brand,color:C.white,border:"none",shadow:SHADOW.brand},
    secondary:{bg:C.white,color:C.slate700,border:`1.5px solid ${C.slate200}`,shadow:SHADOW.sm},
    danger:{bg:"#FBEEEB",color:C.red,border:`1.5px solid #ECCBC3`,shadow:"none"},
    ghost:{bg:"transparent",color:C.slate600,border:`1.5px solid ${C.slate200}`,shadow:"none"},
    green:{bg:C.green,color:C.white,border:"none",shadow:"0 8px 20px rgba(46,139,111,0.26)"},
    dark:{bg:C.slate900,color:C.white,border:"none",shadow:SHADOW.md},
  }[variant];
  const sz={sm:{padding:"7px 14px",fontSize:12},md:{padding:"10px 19px",fontSize:13},lg:{padding:"13px 26px",fontSize:14}}[size];
  return(
    <button style={{...sz,background:v.bg,color:v.color,border:v.border,borderRadius:10,fontWeight:600,cursor:props.disabled?"not-allowed":"pointer",display:"inline-flex",alignItems:"center",gap:7,width:full?"100%":undefined,justifyContent:full?"center":undefined,transition:"all 0.18s cubic-bezier(.2,.7,.3,1)",opacity:props.disabled?0.5:1,letterSpacing:"0.01em",boxShadow:v.shadow}} onMouseEnter={e=>{if(!props.disabled){e.currentTarget.style.filter="brightness(0.94)";e.currentTarget.style.transform="translateY(-1px)";}}} onMouseLeave={e=>{e.currentTarget.style.filter="";e.currentTarget.style.transform="";}} {...props}>
      {loading?<div style={{width:14,height:14,border:"2px solid currentColor",borderTopColor:"transparent",borderRadius:"50%",animation:"spin 0.7s linear infinite"}}/>:children}
    </button>
  );
};

const Chip=({children,active,onClick,color=C.brand})=>(
  <button onClick={onClick} style={{padding:"6px 14px",borderRadius:99,fontSize:12,fontWeight:600,border:`1.5px solid ${active?color:C.slate200}`,cursor:"pointer",background:active?color:C.white,color:active?C.white:C.slate600,transition:"all 0.15s",letterSpacing:"0.01em",whiteSpace:"nowrap"}}>
    {children}
  </button>
);

const ChipGroup=({items,selected,onToggle,color=C.brand})=>(
  <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
    {items.map(item=><Chip key={item} active={selected.includes(item)} onClick={()=>onToggle(item)} color={color}>{item}</Chip>)}
  </div>
);

const Tag=({children,color=C.brand})=>{
  const bg = color+"14";
  return <span style={{background:bg,color,padding:"3px 10px",borderRadius:7,fontSize:11,fontWeight:600,display:"inline-block",margin:"2px 3px 2px 0",letterSpacing:"0.01em"}}>{children}</span>;
};

const Badge=({children,variant="default"})=>{
  const v={
    default:{bg:C.slate100,color:C.slate600},
    brand:{bg:C.brandLt,color:C.brand},
    green:{bg:"#E2F0EA",color:C.green},
    amber:{bg:"#F6ECD8",color:C.amber},
    red:{bg:"#F6E4DF",color:C.red},
  }[variant];
  return <span style={{...v,padding:"3px 10px",borderRadius:7,fontSize:11,fontWeight:700,display:"inline-flex",alignItems:"center",gap:4,whiteSpace:"nowrap",letterSpacing:"0.01em"}}>{children}</span>;
};

const Divider=()=><div style={{height:1,background:C.slate100,margin:"20px 0"}}/>;

const typeConfig = {
  Swimming:{bg:"#E7F0F4",col:"#1C5C76",icon:"🏊"},
  "Arts & Crafts":{bg:"#F6E9EE",col:"#9A3458",icon:"🎨"},
  "Animal Therapy":{bg:"#E6EFE7",col:"#2C6B45",icon:"🐴"},
  Music:{bg:"#EDEAF3",col:"#5A4A8A",icon:"🎵"},
  Sports:{bg:"#F5ECDD",col:"#92591F",icon:"⚽"},
  Drama:{bg:"#F6E8E8",col:"#9A3A41",icon:"🎭"},
  Cooking:{bg:"#F5ECDF",col:"#8A4A24",icon:"🍳"},
  Nature:{bg:"#E6EFE3",col:"#3D6B2C",icon:"🌿"},
  Dance:{bg:"#F6E7F0",col:"#933566",icon:"💃"},
  Technology:{bg:"#E7EEF3",col:"#235873",icon:"💻"},
  Sensory:{bg:"#EFE9F2",col:"#6A3D82",icon:"✨"},
  Therapy:{bg:"#F0E9F0",col:"#73356E",icon:"💆"},
  "Social Skills":{bg:"#E4EFEB",col:"#1F6B57",icon:"🤝"},
};
const getType = t => typeConfig[t] || {bg:C.slate100,col:C.slate600,icon:"🌟"};

// ─── Modal wrapper ────────────────────────────────────────────────────────────
const Modal=({onClose,children,maxWidth=660,noPad})=>(
  <div style={{position:"fixed",inset:0,background:"rgba(26,23,18,0.48)",backdropFilter:"blur(5px)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16,animation:"fadeIn 0.15s ease"}} onClick={e=>e.target===e.currentTarget&&onClose?.()}>
    <div style={{background:C.white,borderRadius:20,maxWidth,width:"100%",maxHeight:"92vh",overflowY:"auto",position:"relative",animation:"fadeUp 0.22s cubic-bezier(.2,.7,.3,1)",boxShadow:SHADOW.xl,border:`1px solid ${C.slate100}`,...(noPad?{}:{padding:34})}}>
      {onClose&&(
        <button onClick={onClose} style={{position:"absolute",top:18,right:18,background:C.slate100,border:"none",borderRadius:10,width:34,height:34,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:C.slate500,zIndex:1,transition:"background 0.15s"}} onMouseEnter={e=>e.currentTarget.style.background=C.slate200} onMouseLeave={e=>e.currentTarget.style.background=C.slate100}>
          <Icons.x/>
        </button>
      )}
      {children}
    </div>
  </div>
);

// ─── Distance badge ───────────────────────────────────────────────────────────
const DistBadge=({dist})=>(
  <Badge variant="brand"><span style={{lineHeight:0}}><Icons.pin/></span>{fmtDist(dist)}</Badge>
);

// ─── Org logo avatar (initials-based, deterministic colour) ──────────────────
const ORG_COLOURS = ["#0F6B5C","#2C6B45","#92591F","#9A3A41","#5A4A8A","#235873","#933566","#3D6B2C","#8A4A24","#73356E"];
function orgColor(name){ let h=0; for(let i=0;i<name.length;i++) h=(h*31+name.charCodeAt(i))&0xffff; return ORG_COLOURS[h%ORG_COLOURS.length]; }
function orgInitials(name){ return name.split(/\s+/).filter(Boolean).slice(0,2).map(w=>w[0].toUpperCase()).join(""); }

const OrgAvatar=({name,size=44})=>{
  const col=orgColor(name);
  const initials=orgInitials(name);
  return(
    <div style={{width:size,height:size,borderRadius:11,background:`linear-gradient(135deg,${col},${col}CC)`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:`0 2px 8px ${col}40`}}>
      <span style={{fontSize:size*0.34,fontWeight:600,color:"white",fontFamily:F.display,letterSpacing:"-0.01em"}}>{initials}</span>
    </div>
  );
};

// ─── Google Places photos ─────────────────────────────────────────────────────
// Pulls each venue's real listing photo from Google's Places API (New).
//
// SETUP:
//   1. Create a key at https://console.cloud.google.com/  → enable "Places API (New)".
//   2. Paste it below. IMPORTANT: restrict the key to your site's domain
//      (Application restrictions → "Websites" / HTTP referrers) so it can't be
//      abused if it appears in client code. For production, the safest pattern is
//      to proxy these two calls through your own backend and keep the key server-side.
//   3. Billing must be enabled; Places has a monthly free tier then per-call cost,
//      which is why results are cached (in-memory + persisted) to avoid repeat calls.
// Google listing photos are fetched through the serverless proxy at
// /api/place-photo (see netlify/functions/place-photo.js), which keeps the
// Google Places key server-side. Set PHOTOS_ENABLED to false to skip Google
// entirely and rely only on the website-preview + gradient fallbacks.
const PHOTOS_ENABLED = true;
const PLACE_PHOTO_ENDPOINT = "/api/place-photo";

const placePhotoCache = {}; // id -> url | null   (null = looked up, none found)
const placePhotoInflight = {}; // id -> Promise

async function resolvePlacePhoto(act, maxWidth = 640) {
  if (!PHOTOS_ENABLED) return null;
  const id = act.id;
  if (placePhotoCache[id] !== undefined) return placePhotoCache[id];
  if (placePhotoInflight[id]) return placePhotoInflight[id];

  placePhotoInflight[id] = (async () => {
    // 1) persisted cache (saves quota across sessions)
    try {
      const saved = await store.get(`placephoto:${id}`);
      if (saved && typeof saved.url !== "undefined") { placePhotoCache[id] = saved.url; return saved.url; }
    } catch {}

    let url = null;
    try {
      // 2) ask our serverless proxy to resolve the venue's listing photo
      const query = `${act.name} ${act.organisation} ${act.location} UK`;
      const res = await fetch(`${PLACE_PHOTO_ENDPOINT}?q=${encodeURIComponent(query)}&w=${maxWidth}`);
      if (res.ok) {
        const data = await res.json();
        url = data?.url || null;
      }
    } catch { url = null; }

    placePhotoCache[id] = url;
    try { await store.set(`placephoto:${id}`, { url }); } catch {}
    return url;
  })();

  const result = await placePhotoInflight[id];
  delete placePhotoInflight[id];
  return result;
}

// React hook: returns the venue photo URL (or null) and a loading flag.
function usePlacePhoto(act) {
  const [url, setUrl] = useState(() => placePhotoCache[act.id] ?? null);
  const [loading, setLoading] = useState(PHOTOS_ENABLED && placePhotoCache[act.id] === undefined);
  useEffect(() => {
    let alive = true;
    if (!PHOTOS_ENABLED) { setLoading(false); return; }
    if (placePhotoCache[act.id] !== undefined) { setUrl(placePhotoCache[act.id]); setLoading(false); return; }
    setLoading(true);
    resolvePlacePhoto(act).then(u => { if (alive) { setUrl(u); setLoading(false); } });
    return () => { alive = false; };
  }, [act.id]);
  return { url, loading };
}

// ─── Type gradient fallback (used when no photo found) ───────────────────────
const TYPE_GRADIENT = {}; // no longer used for colour — all strips use neutral dark
const getGradient = () => ["#2D3748","#2D3748"];

// ─── Card / hero photo with graceful fallback ─────────────────────────────────
// Source priority:
//   1. Google Places listing photo  (best — needs GOOGLE_PLACES_API_KEY)
//   2. Live preview of the venue's own website  (free, no key, via WordPress mShots)
//   3. Type-coloured gradient + icon  (always works)
function websiteShot(act, w = 900) {
  const site = act.website;
  if (!site || !/^https?:\/\//i.test(site)) return null;
  return `https://s0.wp.com/mshots/v1/${encodeURIComponent(site)}?w=${w}`;
}

const PlacePhoto = ({act, height, rounded}) => {
  const { url: gPhoto, loading } = usePlacePhoto(act);
  const [failed, setFailed] = useState(false);
  const tc = getType(act.type);
  const [g1, g2] = getGradient(act.type);
  const ownerPhoto = (act.photos && act.photos.length) ? act.photos[0] : null;
  const src = ownerPhoto || gPhoto || null;
  const showImg = src && !failed;
  // No real photo — show a compact 52px accent strip instead of a big empty block
  const h = showImg ? height : 52;
  return (
    <div style={{height:h, width:"100%", position:"relative", overflow:"hidden",
      background:`linear-gradient(135deg, ${g1}, ${g2})`,
      borderRadius: rounded ? "16px 16px 0 0" : 0,
      transition:"height 0.3s ease"}}>
      {showImg && (
        <img src={src} alt={act.name} loading="lazy" onError={()=>setFailed(true)}
          style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
      )}
      {!showImg && (
        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",padding:"0 14px",gap:10}}>
          <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(circle, rgba(255,255,255,0.14) 1px, transparent 1.5px)",backgroundSize:"12px 12px",opacity:0.6}}/>
          <span style={{fontSize:26,opacity:0.85,position:"relative",zIndex:1}}>{tc.icon}</span>
          <span style={{fontSize:12,fontWeight:700,color:"rgba(255,255,255,0.9)",textTransform:"uppercase",letterSpacing:"0.07em",position:"relative",zIndex:1}}>{act.type}</span>
        </div>
      )}
      {showImg && (
        <>
          <div style={{position:"absolute",left:0,right:0,bottom:0,height:"55%",background:"linear-gradient(to top, rgba(20,16,10,0.42), rgba(20,16,10,0))"}}/>
          {loading && !ownerPhoto && <div style={{position:"absolute",top:10,right:10,width:16,height:16,border:"2px solid rgba(255,255,255,0.5)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>}
        </>
      )}
    </div>
  );
};

// ─── Activity Card ────────────────────────────────────────────────────────────
// ─── Holiday clubs & availability helpers ─────────────────────────────────────
// Availability is provider-set but auto-expires, so families never see stale info.
const AVAIL_OPTS=[
  {v:"spaces", label:"Spaces available", color:"#0F6B5C", bg:"#E4F0ED"},
  {v:"limited",label:"Limited places",  color:"#B0701B", bg:"#F6EBD7"},
  {v:"full",   label:"Full — waitlist", color:"#64748B", bg:"#EEF1F5"},
];
const AVAIL_TTL_DAYS=21; // how long a provider's availability status stays "fresh"
function availFresh(av){
  if(!av||!av.status||!av.updatedAt)return null;
  const days=(Date.now()-new Date(av.updatedAt).getTime())/86400000;
  if(isNaN(days)||days>AVAIL_TTL_DAYS)return null;
  const opt=AVAIL_OPTS.find(o=>o.v===av.status);
  return opt?{...opt,updatedAt:av.updatedAt,days:Math.max(0,Math.floor(days))}:null;
}
function agoLabel(iso){
  if(!iso)return"";
  const d=Math.floor((Date.now()-new Date(iso).getTime())/86400000);
  return d<=0?"today":d===1?"yesterday":`${d} days ago`;
}
function todayISO(){return new Date().toISOString().slice(0,10);}
function upcomingSessions(act){
  const s=(act&&act.sessions)||[];const t=todayISO();
  return s.filter(x=>x&&(x.end||x.start)&&(x.end||x.start)>=t).sort((a,b)=>(a.start||"").localeCompare(b.start||""));
}
// A listing counts as a "holiday club" if it has real dated sessions, or its schedule
// text explicitly says it runs during school holidays. Deliberately NOT based on
// Saturday/Sunday alone — that matched almost every weekend activity and diluted results.
function isHolidayClub(act){
  if(upcomingSessions(act).length>0)return true;
  return (act.time||"").toLowerCase().includes("holiday");
}
function fmtSessionDates(s){
  if(!s)return"";
  const f=d=>{if(!d)return"";const dt=new Date(d+"T00:00:00");return isNaN(dt)?"":dt.toLocaleDateString("en-GB",{day:"numeric",month:"short"});};
  return(s.start&&s.end&&s.start!==s.end)?`${f(s.start)} – ${f(s.end)}`:f(s.start||s.end);
}
// Approximate England school-holiday start dates — adjust per year/region as needed.
const UK_HOLIDAYS=[
  {name:"Summer holidays",     start:"2026-07-22", days:42},
  {name:"October half-term",   start:"2026-10-26", days:7},
  {name:"Christmas holidays",  start:"2026-12-19", days:16},
  {name:"February half-term",  start:"2027-02-15", days:7},
  {name:"Easter holidays",     start:"2027-04-01", days:14},
  {name:"May half-term",       start:"2027-05-31", days:7},
  {name:"Summer holidays",     start:"2027-07-21", days:42},
];
function nextHoliday(){
  const t=new Date(todayISO()+"T00:00:00");
  for(const h of UK_HOLIDAYS){const d=new Date(h.start+"T00:00:00");const days=Math.round((d-t)/86400000);if(days>=0)return{...h,days};}
  return null;
}
const HOLIDAY_WINDOW_DAYS=42; // start surfacing the run-up six weeks ahead
// Builds the in-app notification feed for a family: nearby/saved holiday clubs and
// availability changes. (Real push delivery would need a backend; this is in-app.)
function buildNotifs(activities,user,userLoc){
  const items=[];const fav=new Set((user&&user.favourites)||[]);
  const dismissed=new Set((user&&user.dismissedNotifs)||[]);
  const near=a=>{if(!userLoc)return true;if(a.lat==null||a.lng==null)return false;return haversine(userLoc.lat,userLoc.lng,a.lat,a.lng)<=40*1.60934;};
  (activities||[]).forEach(a=>{
    if(a.category==="charity")return;
    if(near(a)||fav.has(a.id)){
      upcomingSessions(a).forEach(s=>{
        items.push({id:`hol-${a.id}-${s.id||s.start}`,cat:"holiday",icon:"🗓️",title:`Holiday club: ${s.name||a.name}`,sub:`${a.organisation} · ${fmtSessionDates(s)}${s.places?` · ${s.places} places`:""}`,actId:a.id,ts:s.start||""});
      });
    }
    const av=availFresh(a.availability);
    if(av&&(av.v==="spaces"||av.v==="limited")&&(fav.has(a.id)||near(a))){
      items.push({id:`av-${a.id}`,cat:"availability",icon:"●",title:`${av.label}: ${a.name}`,sub:`${a.organisation} · updated ${agoLabel(av.updatedAt)}`,actId:a.id,ts:av.updatedAt||""});
    }
  });
  const sorted=items.sort((x,y)=>String(y.ts).localeCompare(String(x.ts))).slice(0,40);
  const nh=nextHoliday();
  const clubCount=items.filter(i=>i.cat==="holiday").length;
  if(nh&&nh.days<=HOLIDAY_WINDOW_DAYS&&clubCount>0){
    sorted.unshift({id:`season-${nh.start}`,cat:"seasonal",icon:"☀️",title:`${nh.name} ${nh.days===0?"start today":`start in ${nh.days} days`}`,sub:`${clubCount} holiday club${clubCount!==1?"s":""} near you — book early before places fill up`,actId:null,ts:new Date().toISOString()});
  }
  return sorted.filter(n=>!dismissed.has(n.id));
}
const NOTIF_CATS=[
  {key:"seasonal",   label:"School holidays",  icon:"☀️"},
  {key:"holiday",    label:"Holiday clubs",    icon:"🗓️"},
  {key:"availability",label:"Availability",     icon:"●"},
];

const ActivityCard=({act,onOpen,onFav,isFav,isOwner,onEdit,onDelete,onUpgrade,onVerify,dist,reviewVersion})=>{
  const tc = getType(act.type);
  const isFree = act.cost?.toLowerCase()==="free";
  const dot = <span style={{color:C.slate300}}>·</span>;
  const featured = !!act.featured;
  const verified = !featured&&(act.verifiedPaid||act.verified);
  const holidayClub = isHolidayClub(act);
  return(
    <div className="card-hover" onClick={()=>onOpen(act)}
      style={{
        background: featured ? "#FFF3D4" : verified ? "#E6F5F1" : C.white,
        borderRadius:16,
        boxShadow: featured
          ? "0 0 0 3px #F59E0B, 0 16px 48px rgba(245,158,11,0.6), 0 6px 20px rgba(245,158,11,0.4)"
          : verified
            ? "0 10px 36px rgba(15,107,92,0.22), 0 3px 10px rgba(15,107,92,0.12)"
            : "0 8px 30px rgba(40,33,22,0.10), 0 2px 8px rgba(40,33,22,0.06)",
        cursor:"pointer",
        border: featured
          ? "1px solid rgba(245,158,11,0.7)"
          : verified
            ? "1px solid rgba(15,107,92,0.45)"
            : holidayClub
              ? "1px solid rgba(139,92,246,0.35)"
              : `1px solid ${C.slate200}`,
        borderLeft: featured
          ? "5px solid #F59E0B"
          : verified
            ? "5px solid #0F6B5C"
            : holidayClub
              ? "4px solid #C4B5FD"
              : `4px solid ${C.slate200}`,
        display:"flex",flexDirection:"column",overflow:"hidden",
        transition:"box-shadow .25s, transform .25s",
      }}>

      {/* ── Photo header ── */}
      <div style={{position:"relative"}}>
        <PlacePhoto act={act} height={132} rounded={false}/>
        {onFav&&<button onClick={e=>{e.stopPropagation();onFav(act.id);}} style={{position:"absolute",top:8,right:8,width:28,height:28,borderRadius:"50%",background:"rgba(255,255,255,0.88)",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",lineHeight:0,boxShadow:"0 1px 4px rgba(0,0,0,0.15)"}}><Icons.heart filled={isFav}/></button>}
      </div>

      {/* ── Your listing bar — shown to the owner, sits cleanly between photo and tier bar ── */}
      {isOwner&&(
        <div style={{background:"#1A1712",color:"#fff",padding:"5px 14px",display:"flex",alignItems:"center",gap:6,fontSize:11,fontWeight:700,letterSpacing:"0.04em"}}>
          <span style={{fontSize:11}}>📌</span> YOUR LISTING
        </div>
      )}

      {/* ── Tier bar ── */}
      {act.featured&&(
        <div style={{background:"linear-gradient(90deg,#B45309,#D97706,#F59E0B)",padding:"11px 16px",display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:14}}>⭐</span>
          <div style={{flex:1}}>
            <div style={{fontSize:12,fontWeight:800,color:"#fff",letterSpacing:"0.08em",textTransform:"uppercase",lineHeight:1}}>Featured Listing</div>
            <div style={{fontSize:10.5,color:"rgba(255,255,255,0.8)",marginTop:3,fontWeight:500}}>Priority placement</div>
          </div>
          <details onClick={e=>e.stopPropagation()} style={{flexShrink:0,position:"relative"}}>
            <summary style={{display:"flex",alignItems:"center",gap:4,background:"rgba(255,255,255,0.18)",border:"1px solid rgba(255,255,255,0.4)",borderRadius:5,padding:"3px 9px",fontSize:10.5,fontWeight:700,color:"#fff",cursor:"pointer",listStyle:"none"}}>
              ✓ Verified
            </summary>
            <div style={{position:"absolute",top:"100%",marginTop:6,right:0,maxWidth:220,background:"#fff",color:C.slate700,fontSize:11,fontWeight:500,lineHeight:1.5,padding:"10px 12px",borderRadius:8,boxShadow:"0 8px 24px rgba(0,0,0,0.18)",zIndex:5}}>
              This organisation has confirmed their listing details are accurate and kept up to date. Not an independent safety check — please still do your own checks before attending.
            </div>
          </details>
        </div>
      )}
      {!act.featured&&(act.verifiedPaid||act.verified)&&(
        <details onClick={e=>e.stopPropagation()} style={{position:"relative"}}>
          <summary style={{background:"linear-gradient(90deg,#0A5044,#0F6B5C)",padding:"11px 16px",display:"flex",alignItems:"center",gap:8,cursor:"pointer",listStyle:"none"}}>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none"><path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z" fill="rgba(255,255,255,0.25)" stroke="white" strokeWidth={1.5}/><path d="M9 12l2 2 4-4" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></svg>
            <div>
              <div style={{fontSize:11,fontWeight:800,color:"#fff",letterSpacing:"0.06em",textTransform:"uppercase",lineHeight:1}}>Verified Organisation</div>
              <div style={{fontSize:10,color:"rgba(255,255,255,0.7)",marginTop:2,fontWeight:500}}>{act.verifiedPaid?"Verified member — tap to learn more":"Checked by IncludeMe — tap to learn more"}</div>
            </div>
          </summary>
          <div style={{background:"#F7F6F2",padding:"10px 16px",fontSize:11.5,color:C.slate600,lineHeight:1.55,borderBottom:`1px solid ${C.slate200}`}}>
            This organisation has confirmed their listing details are accurate and kept up to date — name, contact info, description and eligibility. It isn't an independent safety check by IncludeMe; please still do your own checks (e.g. DBS, insurance, safeguarding policy) before attending.
          </div>
        </details>
      )}
      {!act.featured&&!(act.verifiedPaid||act.verified)&&act.ownerId&&act.ownerId!=="seed"&&(
        <div style={{background:C.slate100,padding:"9px 16px",display:"flex",alignItems:"center",gap:7}}>
          <svg width={13} height={13} viewBox="0 0 24 24" fill="none"><path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z" stroke={C.slate400} strokeWidth={1.5}/></svg>
          <span style={{fontSize:10.5,fontWeight:700,color:C.slate500,letterSpacing:"0.04em",textTransform:"uppercase"}}>Claimed listing — managed by this organisation</span>
        </div>
      )}

      {/* ── Body ── */}
      <div style={{padding:"15px 18px 15px",display:"flex",flexDirection:"column",flex:1}}>
        {/* Title + where */}
        <h3 style={{margin:"0 0 5px",fontSize:18,fontWeight:600,color:featured?"#7a4f00":verified?"#0a3d2e":C.slate900,lineHeight:1.25,fontFamily:F.display,letterSpacing:"-0.01em"}}>{act.name}</h3>
        <p style={{margin:"0 0 11px",fontSize:12.5,color:featured?"#92660a":verified?"#1a5a47":C.slate500,fontWeight:500,display:"flex",alignItems:"center",gap:6,flexWrap:"wrap",lineHeight:1.4}}>
          <span>{act.organisation}</span>{dot}
          <span style={{display:"inline-flex",alignItems:"center",gap:3}}><Icons.pin/>{act.location}</span>
        </p>

        {/* Description (2 lines max) */}
        <p style={{fontSize:13,color:C.slate500,margin:"0 0 12px",lineHeight:1.5,display:"-webkit-box",WebkitLineClamp:1,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{act.description}</p>

        {/* Key facts (one quiet line) */}
        <div style={{display:"flex",alignItems:"center",gap:7,flexWrap:"wrap",fontSize:12.5,fontWeight:600,color:C.slate700,paddingTop:13,borderTop:`1px solid ${C.slate100}`}}>
          <span>Ages {act.ageMin}–{act.ageMax}</span>{dot}
          <span style={{color:isFree?C.green:C.slate700}}>{isFree?"Free":act.cost}</span>
          {dist!=null&&<>{dot}<span style={{color:C.slate500,display:"inline-flex",alignItems:"center",gap:3}}>{fmtDist(dist)}</span></>}
        </div>

        {/* Trust row: rating only */}
        <div style={{marginTop:10,minHeight:18}}>
          <RatingDisplay actId={act.id} reviewVersion={reviewVersion}/>
        </div>
        {(()=>{const av=availFresh(act.availability);const sess=upcomingSessions(act);const hasCP=(act.accessibility||act.access||[]).includes("Changing Places toilet");if(!av&&!sess.length&&!holidayClub&&!hasCP)return null;return(
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:8}}>
            {av&&<span style={{display:"inline-flex",alignItems:"center",gap:4,background:av.bg,color:av.color,fontSize:11,fontWeight:700,borderRadius:6,padding:"2px 8px"}}>● {av.label}</span>}
            {sess.length>0&&<span style={{display:"inline-flex",alignItems:"center",gap:4,background:"#EDE9FE",color:"#6D28D9",fontSize:11,fontWeight:700,borderRadius:6,padding:"2px 8px"}}>🗓️ Holiday club · {fmtSessionDates(sess[0])}{sess.length>1?` +${sess.length-1}`:""}</span>}
            {sess.length===0&&holidayClub&&<span style={{display:"inline-flex",alignItems:"center",gap:4,background:"#EDE9FE",color:"#6D28D9",fontSize:11,fontWeight:700,borderRadius:6,padding:"2px 8px"}}>🏖️ Holiday club</span>}
            {hasCP&&<span title="Changing Places toilet on site" style={{display:"inline-flex",alignItems:"center",gap:5,background:"#F3EEFF",color:"#5B21B6",fontSize:11,fontWeight:700,borderRadius:6,padding:"2px 8px 2px 6px"}}><span style={{width:14,height:14,borderRadius:"50%",background:"#5B21B6",display:"inline-flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="4.5" r="2"/><circle cx="16" cy="17" r="5"/><path d="M9 7v5l4 2M9 12h5l3.5 6"/></svg></span>Changing Places</span>}
          </div>
        );})()}

        {isOwner&&(
          <div style={{display:"flex",gap:6,marginTop:12,paddingTop:12,borderTop:`1px solid ${featured?"#F6C96A":C.slate100}`,flexWrap:"wrap",alignItems:"center"}} onClick={e=>e.stopPropagation()}>
            <Btn variant="ghost" size="sm" onClick={()=>onEdit(act)}><Icons.edit/>Edit</Btn>
            <Btn variant="danger" size="sm" onClick={()=>onDelete(act.id)}><Icons.trash/></Btn>
            {!featured&&(
              <div style={{marginLeft:"auto",display:"flex",gap:6,flexWrap:"wrap"}}>
                {!act.verifiedPaid&&onVerify&&(
                  <button onClick={()=>onVerify(act)}
                    style={{padding:"6px 10px",borderRadius:8,border:"1.5px solid #0F6B5C",background:"#E4F0ED",color:"#0F6B5C",fontSize:11,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:4,whiteSpace:"nowrap",fontFamily:F.body}}>
                    ✓ Verify £15/mo
                  </button>
                )}
                {onUpgrade&&(
                  <button onClick={()=>onUpgrade(act)}
                    style={{padding:"6px 10px",borderRadius:8,border:"none",background:"linear-gradient(135deg,#F59E0B,#D97706)",color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:4,whiteSpace:"nowrap",boxShadow:"0 2px 8px rgba(217,119,6,0.3)",fontFamily:F.body}}>
                    ⭐ Feature £49/mo
                  </button>
                )}
              </div>
            )}
            {featured&&<span style={{marginLeft:"auto",fontSize:11.5,fontWeight:700,color:"#D97706",display:"flex",alignItems:"center",gap:4}}>⭐ Featured listing</span>}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Star Rating ──────────────────────────────────────────────────────────────
const StarRating=({value,size=14})=>(
  <div style={{display:"flex",gap:1}}>
    {[1,2,3,4,5].map(n=>(
      <span key={n} style={{fontSize:size,color:n<=value?"#F59E0B":"#D1D5DB",lineHeight:1}}>★</span>
    ))}
  </div>
);

// ─── Reviews Section ──────────────────────────────────────────────────────────
const REVIEW_CACHE = {}; // module-level fallback, survives modal open/close within session

// Small rating display for cards
const RatingDisplay=({actId,reviewVersion})=>{
  const [avg,setAvg]=useState(null);
  const [count,setCount]=useState(0);
  const RKEY=`reviews_${String(actId).replace(/[^a-zA-Z0-9]/g,"_")}`;
  useEffect(()=>{
    (async()=>{
      let data=null;
      try{ data=await store.get(RKEY); }catch{}
      const list=Array.isArray(data)?data:(REVIEW_CACHE[RKEY]||[]);
      if(list.length){
        setCount(list.length);
        setAvg(Math.round((list.reduce((s,r)=>s+r.rating,0)/list.length)*10)/10);
      }else{
        setCount(0);setAvg(null);
      }
    })();
  },[actId,reviewVersion]);
  if(!avg)return null;
  return(
    <div style={{display:"flex",alignItems:"center",gap:4}}>
      <span style={{color:"#F59E0B",fontSize:13,lineHeight:1}}>★</span>
      <span style={{fontSize:12,fontWeight:700,color:C.slate700}}>{avg}</span>
      <span style={{fontSize:11,color:C.slate400}}>({count})</span>
    </div>
  );
};

const ReviewsSection=({actId,user,onReviewChange,isOwner,orgName})=>{
  const [reviews,setReviews]=useState([]);
  const [loading,setLoading]=useState(true);
  const [showForm,setShowForm]=useState(false);
  const [rating,setRating]=useState(0);
  const [hoverRating,setHoverRating]=useState(0);
  const [text,setText]=useState("");
  const [submitting,setSubmitting]=useState(false);
  const [error,setError]=useState("");
  const [respondingTo,setRespondingTo]=useState(null);
  const [responseText,setResponseText]=useState("");
  const [respondError,setRespondError]=useState("");
  const [respondSubmitting,setRespondSubmitting]=useState(false);
  const [reportingId,setReportingId]=useState(null);
  const [reportReason,setReportReason]=useState("Inappropriate or offensive");
  const [reportDetails,setReportDetails]=useState("");
  const [reportSubmitting,setReportSubmitting]=useState(false);
  const [reportedIds,setReportedIds]=useState(new Set());

  const RKEY=`reviews_${String(actId).replace(/[^a-zA-Z0-9]/g,"_")}`;

  useEffect(()=>{
    (async()=>{
      let data=null;
      try{ data=await store.get(RKEY); }catch{}
      // Prefer stored data; fall back to in-memory cache
      const list = Array.isArray(data) ? data : (REVIEW_CACHE[RKEY] || []);
      REVIEW_CACHE[RKEY] = list;
      setReviews([...list].sort((a,b)=>b.date-a.date));
      setLoading(false);
    })();
  },[actId]);

  const avg=reviews.length?Math.round((reviews.reduce((s,r)=>s+r.rating,0)/reviews.length)*10)/10:0;
  const alreadyReviewed=user&&reviews.some(r=>r.userId===(user.id||user.email));

  const handleSubmit=async()=>{
    if(user?.blocked){setError("Your account is currently restricted from posting reviews. Contact support if you think this is a mistake.");return;}
    if(!rating){setError("Please select a star rating.");return;}
    if(text.trim().length<10){setError("Please write at least 10 characters.");return;}
    setSubmitting(true);setError("");
    const rev={id:`rev${Date.now()}`,actId,userId:(user.id||user.email),userName:user.name,rating,text:text.trim(),date:Date.now()};
    const updated=[rev,...(REVIEW_CACHE[RKEY]||[])];
    // Update in-memory cache immediately so it survives modal close within session
    REVIEW_CACHE[RKEY]=updated;
    setReviews([...updated].sort((a,b)=>b.date-a.date));
    setShowForm(false);setRating(0);setText("");setSubmitting(false);
    onReviewChange&&onReviewChange();
    // Write through to persistent storage (best-effort)
    try{ await store.set(RKEY,updated); }catch{}
  };

  const handleRespondSubmit=async(reviewId)=>{
    if(responseText.trim().length<2){setRespondError("Please write a response.");return;}
    setRespondSubmitting(true);setRespondError("");
    const base=REVIEW_CACHE[RKEY]||reviews;
    const updated=base.map(r=>r.id===reviewId?{...r,response:{text:responseText.trim(),date:Date.now()}}:r);
    REVIEW_CACHE[RKEY]=updated;
    setReviews([...updated].sort((a,b)=>b.date-a.date));
    setRespondingTo(null);setResponseText("");setRespondSubmitting(false);
    try{ await store.set(RKEY,updated); }catch{}
  };

  const handleRemoveResponse=async(reviewId)=>{
    const base=REVIEW_CACHE[RKEY]||reviews;
    const updated=base.map(r=>{
      if(r.id!==reviewId)return r;
      const {response,...rest}=r;
      return rest;
    });
    REVIEW_CACHE[RKEY]=updated;
    setReviews([...updated].sort((a,b)=>b.date-a.date));
    try{ await store.set(RKEY,updated); }catch{}
  };

  const handleReportSubmit=async(targetType,targetId,targetText)=>{
    if(!user)return;
    setReportSubmitting(true);
    const report={
      id:`rpt${Date.now()}`, actId, targetType, targetId, targetText:(targetText||"").slice(0,500),
      reason:reportReason, details:reportDetails.trim().slice(0,500),
      reporterId:(user.id||user.email), reporterName:user.name||user.email,
      reportedAt:Date.now(), status:"pending"
    };
    try{ await store.set(`report:${report.id}`,report); }catch{}
    setReportSubmitting(false);setReportingId(null);setReportDetails("");setReportReason("Inappropriate or offensive");
    setReportedIds(prev=>new Set([...prev,targetId]));
  };

  return(
    <div style={{marginTop:28,borderTop:`1px solid ${C.slate200}`,paddingTop:24}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,flexWrap:"wrap",gap:8}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <p style={{margin:0,fontSize:11,fontWeight:700,color:C.slate500,textTransform:"uppercase",letterSpacing:"0.07em"}}>Reviews</p>
          {reviews.length>0&&(
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <StarRating value={Math.round(avg)}/>
              <span style={{fontSize:13,fontWeight:700,color:C.slate800}}>{avg}</span>
              <span style={{fontSize:12,color:C.slate400}}>({reviews.length})</span>
            </div>
          )}
        </div>
        {user&&!alreadyReviewed&&!showForm&&(
          <button onClick={()=>setShowForm(true)} style={{padding:"6px 14px",borderRadius:7,border:`1.5px solid ${C.brand}`,background:C.white,color:C.brand,fontWeight:600,fontSize:12,cursor:"pointer",fontFamily:F.body}}>
            Write a review
          </button>
        )}
      </div>

      {showForm&&(
        <div style={{background:C.slate50,borderRadius:10,padding:16,marginBottom:16,border:`1px solid ${C.slate200}`}}>
          <p style={{margin:"0 0 10px",fontSize:13,fontWeight:600,color:C.slate700}}>Your rating</p>
          <div style={{display:"flex",gap:4,marginBottom:14}}>
            {[1,2,3,4,5].map(n=>(
              <span key={n} onClick={()=>setRating(n)} onMouseEnter={()=>setHoverRating(n)} onMouseLeave={()=>setHoverRating(0)}
                style={{fontSize:28,cursor:"pointer",color:n<=(hoverRating||rating)?"#F59E0B":"#D1D5DB",lineHeight:1,transition:"color 0.1s"}}>★</span>
            ))}
          </div>
          <textarea value={text} onChange={e=>setText(e.target.value)}
            placeholder="Share your experience — what was good, what could improve, would you recommend it?"
            style={{width:"100%",minHeight:88,padding:"10px 12px",border:`1.5px solid ${C.slate200}`,borderRadius:8,fontSize:13,resize:"vertical",outline:"none",boxSizing:"border-box",fontFamily:F.body,color:C.slate800,lineHeight:1.6}}
            onFocus={e=>{e.target.style.borderColor=C.brand;e.target.style.boxShadow=`0 0 0 3px ${C.brand}14`;}}
            onBlur={e=>{e.target.style.borderColor=C.slate200;e.target.style.boxShadow="none";}}
          />
          {error&&<p style={{margin:"6px 0 0",fontSize:12,color:C.red}}>{error}</p>}
          <div style={{display:"flex",gap:8,marginTop:10}}>
            <button onClick={handleSubmit} disabled={submitting} style={{padding:"7px 18px",borderRadius:7,border:"none",background:C.brand,color:"white",fontWeight:600,fontSize:13,cursor:"pointer",fontFamily:F.body,opacity:submitting?0.6:1}}>
              {submitting?"Submitting…":"Submit review"}
            </button>
            <button onClick={()=>{setShowForm(false);setRating(0);setText("");setError("");}} style={{padding:"7px 14px",borderRadius:7,border:`1px solid ${C.slate200}`,background:C.white,color:C.slate500,fontWeight:500,fontSize:13,cursor:"pointer",fontFamily:F.body}}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {!user&&<p style={{fontSize:13,color:C.slate400,margin:"0 0 14px"}}>Sign in to leave a review.</p>}

      {loading?(
        <p style={{fontSize:13,color:C.slate400}}>Loading reviews…</p>
      ):reviews.length===0?(
        <div style={{textAlign:"center",padding:"24px 0",color:C.slate400}}>
          <div style={{fontSize:32,marginBottom:8}}>💬</div>
          <p style={{margin:0,fontSize:13}}>No reviews yet — be the first!</p>
        </div>
      ):(
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {reviews.map(r=>(
            <div key={r.id} style={{background:C.white,borderRadius:10,padding:14,border:`1px solid ${C.slate100}`}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{width:28,height:28,borderRadius:"50%",background:C.brand,display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:11,fontWeight:700,flexShrink:0}}>
                    {r.userName[0].toUpperCase()}
                  </div>
                  <span style={{fontWeight:600,fontSize:13,color:C.slate800}}>{r.userName}</span>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <StarRating value={r.rating}/>
                  <span style={{fontSize:11,color:C.slate400}}>{new Date(r.date).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})}</span>
                </div>
              </div>
              <p style={{margin:0,fontSize:13,color:C.slate600,lineHeight:1.65}}>{r.text}</p>

              {user&&r.userId!==(user.id||user.email)&&reportingId!==r.id&&(
                reportedIds.has(r.id)?(
                  <span style={{display:"inline-block",marginTop:6,fontSize:11,color:C.slate400}}>Reported — thank you</span>
                ):(
                  <span onClick={()=>{setReportingId(r.id);setReportReason("Inappropriate or offensive");setReportDetails("");}} style={{display:"inline-block",marginTop:6,fontSize:11.5,fontWeight:600,color:C.slate400,cursor:"pointer"}}>🚩 Report</span>
                )
              )}

              {reportingId===r.id&&(
                <div style={{marginTop:8,background:C.slate50,borderRadius:8,padding:12,border:`1px solid ${C.slate200}`}}>
                  <p style={{margin:"0 0 8px",fontSize:12,fontWeight:600,color:C.slate700}}>Report this review</p>
                  <select value={reportReason} onChange={e=>setReportReason(e.target.value)} style={{width:"100%",padding:"7px 9px",border:`1.5px solid ${C.slate200}`,borderRadius:7,fontSize:12.5,marginBottom:8,fontFamily:F.body,color:C.slate800,background:C.white}}>
                    {["Inappropriate or offensive","Spam or fake review","Harassment or abuse","Not relevant to this listing","Other"].map(o=><option key={o} value={o}>{o}</option>)}
                  </select>
                  <textarea value={reportDetails} onChange={e=>setReportDetails(e.target.value)} placeholder="Anything else we should know? (optional)"
                    style={{width:"100%",minHeight:50,padding:"8px 10px",border:`1.5px solid ${C.slate200}`,borderRadius:7,fontSize:12.5,resize:"vertical",outline:"none",boxSizing:"border-box",fontFamily:F.body,color:C.slate800,lineHeight:1.5}}/>
                  <div style={{display:"flex",gap:8,marginTop:8}}>
                    <button onClick={()=>handleReportSubmit("review",r.id,r.text)} disabled={reportSubmitting} style={{padding:"6px 14px",borderRadius:6,border:"none",background:C.red,color:"white",fontWeight:600,fontSize:12,cursor:"pointer",fontFamily:F.body,opacity:reportSubmitting?0.6:1}}>
                      {reportSubmitting?"Submitting…":"Submit report"}
                    </button>
                    <button onClick={()=>setReportingId(null)} style={{padding:"6px 12px",borderRadius:6,border:`1px solid ${C.slate200}`,background:C.white,color:C.slate500,fontWeight:500,fontSize:12,cursor:"pointer",fontFamily:F.body}}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {r.response&&respondingTo!==r.id&&(
                <div style={{marginTop:10,background:C.slate50,borderRadius:8,padding:"10px 12px",border:`1px solid ${C.slate100}`,borderLeft:`3px solid ${C.brand}`}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4,flexWrap:"wrap",gap:6}}>
                    <span style={{fontSize:10.5,fontWeight:700,color:C.brand,textTransform:"uppercase",letterSpacing:"0.08em"}}>Response from {orgName||"the provider"}</span>
                    <span style={{fontSize:11,color:C.slate400}}>{new Date(r.response.date).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})}</span>
                  </div>
                  <p style={{margin:0,fontSize:13,color:C.slate600,lineHeight:1.6}}>{r.response.text}</p>
                  <div style={{display:"flex",gap:14,marginTop:8,alignItems:"center"}}>
                    {isOwner&&(
                      <>
                        <span onClick={()=>{setRespondingTo(r.id);setResponseText(r.response.text);setRespondError("");}} style={{fontSize:11.5,fontWeight:600,color:C.slate500,cursor:"pointer"}}>Edit</span>
                        <span onClick={()=>handleRemoveResponse(r.id)} style={{fontSize:11.5,fontWeight:600,color:C.red,cursor:"pointer"}}>Remove</span>
                      </>
                    )}
                    {!isOwner&&user&&(
                      reportedIds.has(`resp-${r.id}`)?(
                        <span style={{fontSize:11,color:C.slate400}}>Reported — thank you</span>
                      ):(
                        <span onClick={()=>{setReportingId(`resp-${r.id}`);setReportReason("Inappropriate or offensive");setReportDetails("");}} style={{fontSize:11,fontWeight:600,color:C.slate400,cursor:"pointer"}}>🚩 Report</span>
                      )
                    )}
                  </div>
                  {reportingId===`resp-${r.id}`&&(
                    <div style={{marginTop:8,background:C.white,borderRadius:8,padding:12,border:`1px solid ${C.slate200}`}}>
                      <p style={{margin:"0 0 8px",fontSize:12,fontWeight:600,color:C.slate700}}>Report this response</p>
                      <select value={reportReason} onChange={e=>setReportReason(e.target.value)} style={{width:"100%",padding:"7px 9px",border:`1.5px solid ${C.slate200}`,borderRadius:7,fontSize:12.5,marginBottom:8,fontFamily:F.body,color:C.slate800,background:C.white}}>
                        {["Inappropriate or offensive","Spam or fake","Harassment or abuse","Misleading information","Other"].map(o=><option key={o} value={o}>{o}</option>)}
                      </select>
                      <textarea value={reportDetails} onChange={e=>setReportDetails(e.target.value)} placeholder="Anything else we should know? (optional)"
                        style={{width:"100%",minHeight:50,padding:"8px 10px",border:`1.5px solid ${C.slate200}`,borderRadius:7,fontSize:12.5,resize:"vertical",outline:"none",boxSizing:"border-box",fontFamily:F.body,color:C.slate800,lineHeight:1.5}}/>
                      <div style={{display:"flex",gap:8,marginTop:8}}>
                        <button onClick={()=>handleReportSubmit("response",`resp-${r.id}`,r.response.text)} disabled={reportSubmitting} style={{padding:"6px 14px",borderRadius:6,border:"none",background:C.red,color:"white",fontWeight:600,fontSize:12,cursor:"pointer",fontFamily:F.body,opacity:reportSubmitting?0.6:1}}>
                          {reportSubmitting?"Submitting…":"Submit report"}
                        </button>
                        <button onClick={()=>setReportingId(null)} style={{padding:"6px 12px",borderRadius:6,border:`1px solid ${C.slate200}`,background:C.white,color:C.slate500,fontWeight:500,fontSize:12,cursor:"pointer",fontFamily:F.body}}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {isOwner&&!r.response&&respondingTo!==r.id&&(
                <button onClick={()=>{setRespondingTo(r.id);setResponseText("");setRespondError("");}} style={{marginTop:10,padding:"5px 12px",borderRadius:6,border:`1px solid ${C.slate200}`,background:C.white,color:C.slate500,fontWeight:600,fontSize:11.5,cursor:"pointer",fontFamily:F.body}}>
                  💬 Respond as {orgName||"provider"}
                </button>
              )}

              {respondingTo===r.id&&(
                <div style={{marginTop:10,background:C.slate50,borderRadius:8,padding:12,border:`1px solid ${C.slate200}`}}>
                  <textarea value={responseText} onChange={e=>setResponseText(e.target.value)}
                    placeholder="Thank the reviewer, address any concerns, or share an update..."
                    style={{width:"100%",minHeight:64,padding:"8px 10px",border:`1.5px solid ${C.slate200}`,borderRadius:7,fontSize:12.5,resize:"vertical",outline:"none",boxSizing:"border-box",fontFamily:F.body,color:C.slate800,lineHeight:1.55}}
                    onFocus={e=>{e.target.style.borderColor=C.brand;e.target.style.boxShadow=`0 0 0 3px ${C.brand}14`;}}
                    onBlur={e=>{e.target.style.borderColor=C.slate200;e.target.style.boxShadow="none";}}
                  />
                  {respondError&&<p style={{margin:"6px 0 0",fontSize:12,color:C.red}}>{respondError}</p>}
                  <div style={{display:"flex",gap:8,marginTop:8}}>
                    <button onClick={()=>handleRespondSubmit(r.id)} disabled={respondSubmitting} style={{padding:"6px 14px",borderRadius:6,border:"none",background:C.brand,color:"white",fontWeight:600,fontSize:12,cursor:"pointer",fontFamily:F.body,opacity:respondSubmitting?0.6:1}}>
                      {respondSubmitting?"Posting…":"Post response"}
                    </button>
                    <button onClick={()=>{setRespondingTo(null);setResponseText("");setRespondError("");}} style={{padding:"6px 12px",borderRadius:6,border:`1px solid ${C.slate200}`,background:C.white,color:C.slate500,fontWeight:500,fontSize:12,cursor:"pointer",fontFamily:F.body}}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Detail Modal ─────────────────────────────────────────────────────────────
// ─── Featured Badge ───────────────────────────────────────────────────────────
const FeaturedBadge=()=>(
  <span style={{background:"linear-gradient(135deg,#F59E0B,#D97706)",color:"#fff",padding:"3px 11px",borderRadius:7,fontSize:11,fontWeight:700,display:"inline-flex",alignItems:"center",gap:5,boxShadow:"0 2px 8px rgba(217,119,6,0.28)"}}>
    ⭐ Featured
  </span>
);

// ─── Claim Listing Modal ──────────────────────────────────────────────────────
const ClaimModal=({act,user,onClose})=>{
  const [form,setForm]=useState({name:user?.name||"",role:"",email:""});
  const [submitted,setSubmitted]=useState(false);
  const [loading,setLoading]=useState(false);
  const [err,setErr]=useState("");
  const set=k=>e=>setForm(f=>({...f,[k]:e.target.value}));
  const submit=async()=>{
    if(user?.accountType!=="business"){setErr("Only organisation accounts can claim listings.");return;}
    if(!form.name||!form.role||!form.email){setErr("Please fill in all fields.");return;}
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)){setErr("Please enter a valid email address.");return;}
    setLoading(true);setErr("");
    try{
      const{data:sessionData}=await sb.auth.getSession();
      const token=sessionData?.session?.access_token;
      if(!token)throw new Error("Please sign in again to claim this listing.");
      let handled=false;
      try{
        const res=await fetch(`${API_BASE}/.netlify/functions/submit-claim`,{
          method:"POST",
          headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},
          body:JSON.stringify({actId:act.id,actName:act.name,orgName:act.organisation,claimantName:form.name,role:form.role,email:form.email})
        });
        if(res.ok){handled=true;setSubmitted(true);}
        else if(res.status===409){const b=await res.json().catch(()=>({}));setErr(b.error||"This listing has already been claimed.");setLoading(false);return;}
        // any other non-OK (e.g. 500/404) falls through to the direct path below
      }catch{ /* function unreachable (preview/demo) — fall through to direct write */ }
      if(!handled){
        // Fallback for environments without the function deployed (offline
        // preview). Direct upsert — works for fresh listings; if a stale row
        // blocks it, the friendly error below tells the user to get in touch.
        const{error:upErr}=await sb.from("kv").upsert({
          key:`claim:${act.id}`,
          value:{actId:act.id,actName:act.name,orgName:act.organisation,userId:sessionData.session.user.id,claimantName:form.name,role:form.role,email:form.email,status:"pending",submittedAt:new Date().toISOString()}
        },{onConflict:"key"});
        if(upErr)throw new Error(upErr.message);
        setSubmitted(true);
      }
    }catch{setErr("Something went wrong — please try again. If this keeps happening, contact hello@includeme.uk.");}
    setLoading(false);
  };
  return(
    <Modal onClose={onClose} maxWidth={480}>
      {submitted?(
        <div style={{textAlign:"center",padding:"8px 0 16px"}}>
          <div style={{fontSize:44,marginBottom:16}}>✅</div>
          <h3 style={{margin:"0 0 10px",fontFamily:F.display,fontWeight:600,fontSize:22,color:C.slate900}}>Claim submitted</h3>
          <p style={{color:C.slate500,fontSize:14,lineHeight:1.6,margin:"0 0 22px"}}>We'll verify your connection to <strong>{act.organisation}</strong> and transfer ownership within 48 hours. We'll email <strong>{form.email}</strong> to confirm.</p>
          <Btn onClick={onClose} full>Done</Btn>
        </div>
      ):(
        <>
          <h3 style={{margin:"0 0 6px",fontFamily:F.display,fontWeight:600,fontSize:20,color:C.slate900,paddingRight:32}}>Claim this listing</h3>
          <p style={{margin:"0 0 22px",color:C.slate500,fontSize:13.5,lineHeight:1.55}}>Do you own or manage <strong>{act.organisation}</strong>? Claiming your listing lets you update details, upload photos, respond to reviews and see how many families are viewing your page.</p>
          <Field label="Your name"><input style={inputStyle} value={form.name} onChange={set("name")} placeholder="Jane Smith"/></Field>
          <Field label="Your role"><input style={inputStyle} value={form.role} onChange={set("role")} placeholder="Owner / Manager / Marketing coordinator"/></Field>
          <Field label="Your business email" sub="Use your organisation's email domain to verify your connection"><input style={inputStyle} type="email" value={form.email} onChange={set("email")} placeholder="jane@yourorganisation.org.uk"/></Field>
          {err&&<p style={{color:C.red,fontSize:13,margin:"0 0 14px"}}>{err}</p>}
          <Btn full loading={loading} onClick={submit}>Submit claim</Btn>
          <p style={{fontSize:11.5,color:C.slate400,marginTop:14,textAlign:"center",lineHeight:1.5}}>Charities and non-profits are always listed free. We verify ownership before transferring control.</p>
        </>
      )}
    </Modal>
  );
};

// ─── Featured Upgrade Modal ───────────────────────────────────────────────────
// ─── Verified Badge (paid tier — teal gradient to signal certification) ────────
const VerifiedBadge=()=>(
  <span style={{background:"linear-gradient(135deg,#0F6B5C,#2A8C7B)",color:"#fff",padding:"3px 10px",borderRadius:7,fontSize:11,fontWeight:700,display:"inline-flex",alignItems:"center",gap:4,boxShadow:"0 2px 6px rgba(15,107,92,0.22)"}}>
    <Icons.check/>Verified
  </span>
);

// ─── Get Verified Modal (£15/month — trust tier) ──────────────────────────────
const GetVerifiedModal=({act,user,onClose,onActivated})=>{
  const [submitted,setSubmitted]=useState(false);
  const [loading,setLoading]=useState(false);
  const [err,setErr]=useState("");
  const perks=[
    ["✓","Verified badge on your listing","A teal certified badge shows families your sessions are real, regularly active, and have been reviewed by IncludeMe"],
    ["🛡️","Trust signal for new visitors","Parents searching for the first time are far more likely to contact a verified listing over an unverified one"],
    ["📧","Annual re-confirmation email","We check in once a year to confirm your details are still accurate — keeping the directory trustworthy for families"],
    ["🤝","Priority for council partnerships","Verified listings are the first we recommend to local authority SEND teams and Local Offer directories"],
  ];
  const activate=async()=>{
    setLoading(true);setErr("");
    try{
      const{redirecting}=await attemptCheckoutOrFallback(act,"verified",onActivated);
      if(!redirecting)setSubmitted(true); // redirecting=true means the page is navigating to Stripe right now
    }catch(e){setErr(e.message||"Something went wrong — please try again.");}
    setLoading(false);
  };
  return(
    <Modal onClose={onClose} maxWidth={480}>
      {submitted?(
        <div style={{textAlign:"center",padding:"8px 0 16px"}}>
          <div style={{fontSize:44,marginBottom:16}}>✅</div>
          <h3 style={{margin:"0 0 10px",fontFamily:F.display,fontWeight:600,fontSize:22,color:C.slate900}}>You're now Verified</h3>
          <p style={{color:C.slate500,fontSize:14,lineHeight:1.6,margin:"0 0 22px"}}><strong>{act.organisation}</strong> now shows the Verified badge — effective right now.</p>
          <Btn onClick={onClose} full>Done</Btn>
        </div>
      ):(
        <>
          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:18,gap:12}}>
            <div>
              <h3 style={{margin:"0 0 4px",fontFamily:F.display,fontWeight:600,fontSize:20,color:C.slate900}}>Get Verified</h3>
              <p style={{margin:0,color:C.slate500,fontSize:13.5}}>A trusted signal that your organisation is real and actively running sessions</p>
            </div>
            <div style={{textAlign:"right",flexShrink:0}}>
              <div style={{fontSize:24,fontWeight:700,color:C.slate900,fontFamily:F.display}}>£15</div>
              <div style={{fontSize:11,color:C.slate400,fontWeight:600}}>per month</div>
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:18}}>
            {perks.map(([icon,title,desc])=>(
              <div key={title} style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                <span style={{fontSize:18,lineHeight:1,flexShrink:0,marginTop:2}}>{icon}</span>
                <div><div style={{fontWeight:600,fontSize:14,color:C.slate800,marginBottom:2}}>{title}</div><div style={{fontSize:12.5,color:C.slate500,lineHeight:1.5}}>{desc}</div></div>
              </div>
            ))}
          </div>
          <div style={{background:"#E4F0ED",borderRadius:10,padding:13,marginBottom:18,fontSize:13,color:C.brand,lineHeight:1.55}}>
            <strong>Want more than just the badge?</strong> Upgrade to Featured (£49/month) instead — it includes Verified <em>plus</em> top search placement and a gold Featured badge.
          </div>
          {err&&<p style={{color:C.red,fontSize:13,margin:"0 0 12px",textAlign:"center"}}>{err}</p>}
          <Btn full loading={loading} onClick={activate}>Pay £15 &amp; activate →</Btn>
          <p style={{fontSize:11.5,color:C.slate400,marginTop:12,textAlign:"center"}}>Registered charities are verified free of charge — contact us. Cancel any time.</p>
        </>
      )}
    </Modal>
  );
};

const FeaturedUpgradeModal=({act,user,onClose,onActivated,onEdit})=>{
  const [submitted,setSubmitted]=useState(false);
  const [loading,setLoading]=useState(false);
  const [err,setErr]=useState("");
  const perks=[
    ["🔝","Priority placement","Your listing appears in the priority band above standard results when families search near you"],
    ["⭐","Featured badge","A prominent gold badge signals quality and builds trust with parents and carers"],
    ["📊","Analytics dashboard","See views and saves on your listing in My Listings — updated as families browse"],
    ["📸","Rich media","Add up to 6 photos and an extended description to show your space properly"],
    ["💬","Review responses","Publicly reply to family reviews to show how engaged and responsive you are"],
  ];
  const pay=async()=>{
    setLoading(true);setErr("");
    try{
      const{redirecting}=await attemptCheckoutOrFallback(act,"featured",onActivated);
      if(!redirecting)setSubmitted(true);
    }catch(e){setErr(e.message||"Something went wrong — please try again.");}
    setLoading(false);
  };
  return(
    <Modal onClose={onClose} maxWidth={500}>
      {submitted?(
        <div style={{padding:"4px 0 8px"}}>
          <div style={{textAlign:"center",marginBottom:18}}>
            <div style={{fontSize:44,marginBottom:12}}>✅</div>
            <h3 style={{margin:"0 0 8px",fontFamily:F.display,fontWeight:600,fontSize:22,color:C.slate900}}>You're now Featured</h3>
            <p style={{color:C.slate500,fontSize:14,lineHeight:1.6,margin:0}}><strong>{act.name}</strong> is live with priority placement and the gold badge — effective right now.</p>
          </div>
          <div style={{background:C.brandLt,borderRadius:12,padding:"16px 18px",marginBottom:18}}>
            <div style={{fontSize:11,fontWeight:700,color:C.brand,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:10}}>What you can do now</div>
            {[["📸","Add up to 6 photos and an extended description"],["📊","Track views and saves in My Listings"],["⭐","Appear in priority placement near local families"]].map(([i,t])=>(
              <div key={t} style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:8}}>
                <span style={{fontSize:15,lineHeight:1.3}}>{i}</span>
                <span style={{fontSize:13,color:C.slate700,lineHeight:1.45}}>{t}</span>
              </div>
            ))}
          </div>
          <div style={{display:"flex",gap:10}}>
            {onEdit&&<Btn full variant="secondary" onClick={()=>{onEdit(act);onClose();}}>📸 Add photos</Btn>}
            <Btn full onClick={onClose}>Done</Btn>
          </div>
          <p style={{fontSize:11,color:C.slate400,marginTop:12,textAlign:"center"}}>£49/month · cancel any time from My Listings.</p>
        </div>
      ):(
        <>
          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:18,gap:12}}>
            <div>
              <h3 style={{margin:"0 0 4px",fontFamily:F.display,fontWeight:600,fontSize:20,color:C.slate900}}>Upgrade to Featured</h3>
              <p style={{margin:0,color:C.slate500,fontSize:13.5}}>Get seen by more families actively searching for SEND activities</p>
            </div>
            <div style={{textAlign:"right",flexShrink:0}}>
              <div style={{fontSize:24,fontWeight:700,color:C.slate900,fontFamily:F.display}}>£49</div>
              <div style={{fontSize:11,color:C.slate400,fontWeight:600}}>per month</div>
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:22}}>
            {perks.map(([icon,title,desc])=>(
              <div key={title} style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                <span style={{fontSize:20,lineHeight:1,flexShrink:0,marginTop:1}}>{icon}</span>
                <div><div style={{fontWeight:600,fontSize:14,color:C.slate800,marginBottom:2}}>{title}</div><div style={{fontSize:12.5,color:C.slate500,lineHeight:1.5}}>{desc}</div></div>
              </div>
            ))}
          </div>
          <div style={{background:C.brandLt,borderRadius:10,padding:14,marginBottom:18,fontSize:13,color:C.brand,lineHeight:1.55}}>
            <strong>For {act.name}</strong> — activates instantly, no waiting. No long-term contract, cancel any time.
          </div>
          {err&&<p style={{color:C.red,fontSize:13,margin:"0 0 12px",textAlign:"center"}}>{err}</p>}
          <Btn full loading={loading} onClick={pay}>Pay £49 &amp; activate →</Btn>
          <p style={{fontSize:11.5,color:C.slate400,marginTop:12,textAlign:"center"}}>Registered charities on our free tier are not eligible for paid placement.</p>
        </>
      )}
    </Modal>
  );
};

const DetailModal=({act,dist,onClose,user,onReviewChange,onEnquire,onRequireAuth,autoClaim})=>{
  if(!act)return null;
  const tc=getType(act.type);
  const [showClaim,setShowClaim]=useState(false);
  // Arrived from a claim-invite email (?id=X&claim=1): open the claim flow
  // automatically so the provider is right where they need to be.
  useEffect(()=>{if(autoClaim)setShowClaim(true);},[autoClaim]);
  const [showReport,setShowReport]=useState(false);
  const [reportReason,setReportReason]=useState("Incorrect details (address, times, cost, etc.)");
  const [reportDetails,setReportDetails]=useState("");
  const [reportSubmitting,setReportSubmitting]=useState(false);
  const [reportSubmitted,setReportSubmitted]=useState(false);
  const submitListingReport=async()=>{
    setReportSubmitting(true);
    try{
      const id=`rpt${Date.now()}`;
      await store.set(`report:${id}`,{
        id, actId:act.id, targetType:"listing", targetText:act.name,
        reason:reportReason, details:reportDetails.trim().slice(0,500),
        reporterId:(user?.id||user?.email||"anon"), reporterName:user?.name||user?.email||"Anonymous",
        reportedAt:Date.now(), status:"pending"
      });
    }catch{}
    setReportSubmitting(false);setReportSubmitted(true);
  };
  const [heroIdx,setHeroIdx]=useState(0);
  const photos=act.photos&&act.photos.length?act.photos:null;
  // track this view
  useEffect(()=>{
    setHeroIdx(0);
    // Track view: increment total and log today in the daily history
    const todayKey=new Date().toISOString().slice(0,10);
    store.get(`views:${act.id}`).then(v=>{
      const count=((v?.count)||0)+1;
      store.set(`views:${act.id}`,{count});
      return store.get(`views_history:${act.id}`);
    }).then(vh=>{
      const hist=vh?.days||{};hist[todayKey]=(hist[todayKey]||0)+1;
      store.set(`views_history:${act.id}`,{days:hist});
    }).catch(()=>{});
  },[act.id]);
  return(
    <Modal onClose={onClose} maxWidth={700}>
      {showClaim&&<ClaimModal act={act} user={user} onClose={()=>setShowClaim(false)}/>}
      {showReport&&(
        <Modal onClose={()=>{setShowReport(false);setReportSubmitted(false);setReportDetails("");}} maxWidth={440}>
          {reportSubmitted?(
            <div style={{textAlign:"center",padding:"10px 0"}}>
              <div style={{fontSize:36,marginBottom:10}}>✅</div>
              <h3 style={{margin:"0 0 6px",fontFamily:F.display,fontSize:18,fontWeight:600,color:C.slate900}}>Thanks for letting us know</h3>
              <p style={{margin:"0 0 16px",fontSize:13,color:C.slate500,lineHeight:1.6}}>We'll review this listing and correct it if needed.</p>
              <Btn full onClick={()=>{setShowReport(false);setReportSubmitted(false);setReportDetails("");}}>Close</Btn>
            </div>
          ):(
            <>
              <h3 style={{margin:"0 0 4px",fontFamily:F.display,fontSize:18,fontWeight:600,color:C.slate900}}>Report a problem with this listing</h3>
              <p style={{margin:"0 0 16px",fontSize:12.5,color:C.slate400}}>Spotted wrong details, a closed activity, or something that doesn't look right? Let us know.</p>
              <label style={{fontSize:12,fontWeight:600,color:C.slate700,display:"block",marginBottom:5}}>What's wrong?</label>
              <select value={reportReason} onChange={e=>setReportReason(e.target.value)} style={{width:"100%",padding:"9px 11px",border:`1.5px solid ${C.slate200}`,borderRadius:8,fontSize:13,marginBottom:12,fontFamily:F.body,color:C.slate800,background:C.white}}>
                {["Incorrect details (address, times, cost, etc.)","This activity/provider has closed down","Accessibility claim is wrong","Contact details don't work","Inappropriate or offensive content","Other"].map(o=><option key={o} value={o}>{o}</option>)}
              </select>
              <label style={{fontSize:12,fontWeight:600,color:C.slate700,display:"block",marginBottom:5}}>Anything else? (optional)</label>
              <textarea value={reportDetails} onChange={e=>setReportDetails(e.target.value)} placeholder="e.g. the correct address, or what you found"
                style={{width:"100%",minHeight:70,padding:"9px 11px",border:`1.5px solid ${C.slate200}`,borderRadius:8,fontSize:13,resize:"vertical",outline:"none",boxSizing:"border-box",fontFamily:F.body,color:C.slate800,lineHeight:1.55,marginBottom:14}}/>
              <Btn full onClick={submitListingReport} loading={reportSubmitting}>Submit report</Btn>
            </>
          )}
        </Modal>
      )}
      <div style={{borderRadius:14,overflow:"hidden",marginBottom:photos&&photos.length>1?10:18,boxShadow:SHADOW.sm}}>
        {photos
          ? <img src={photos[heroIdx]||photos[0]} alt={act.name} style={{width:"100%",height:220,objectFit:"cover",display:"block"}}/>
          : <PlacePhoto act={act} height={200} rounded={false}/>}
      </div>
      {photos&&photos.length>1&&(
        <div style={{display:"flex",gap:8,overflowX:"auto",marginBottom:18,paddingBottom:2}}>
          {photos.map((p,i)=>(
            <button key={i} type="button" onClick={()=>setHeroIdx(i)} style={{flexShrink:0,width:66,height:50,borderRadius:8,overflow:"hidden",border:`2px solid ${i===heroIdx?C.brand:"transparent"}`,padding:0,cursor:"pointer",background:"none",lineHeight:0}}>
              <img src={p} alt="" style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
            </button>
          ))}
        </div>
      )}
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16}}>
        <span style={{background:tc.bg,color:tc.col,padding:"4px 12px",borderRadius:6,fontSize:12,fontWeight:700}}>{tc.icon} {act.type}</span>
        {act.featured&&<FeaturedBadge/>}
        {act.verified&&(
          <details onClick={e=>e.stopPropagation()} style={{position:"relative",display:"inline-block"}}>
            <summary style={{listStyle:"none",cursor:"pointer",display:"inline-flex"}}>
              <Badge variant="green"><Icons.check/>Verified</Badge>
            </summary>
            <div style={{position:"absolute",top:"100%",marginTop:6,left:0,maxWidth:240,background:"#fff",color:C.slate700,fontSize:11.5,fontWeight:500,lineHeight:1.55,padding:"12px 14px",borderRadius:10,boxShadow:"0 8px 24px rgba(0,0,0,0.18)",border:`1px solid ${C.slate200}`,zIndex:5}}>
              This organisation has confirmed their listing details are accurate and kept up to date. It isn't an independent safety check by IncludeMe — please still do your own checks (e.g. DBS, insurance, safeguarding policy) before attending.
            </div>
          </details>
        )}
        {dist!=null&&<DistBadge dist={dist}/>}
      </div>
      <h2 style={{margin:"0 0 4px",fontSize:22,fontWeight:700,color:C.slate900,fontFamily:F.display,paddingRight:40}}>{act.name}</h2>
      <p style={{margin:"0 0 16px",color:C.slate400,fontSize:13,fontWeight:500}}>{act.organisation}</p>
      {!(user&&user.accountType==="business")&&(
        <button onClick={()=>{ if(!user){onRequireAuth&&onRequireAuth();return;} onEnquire&&onEnquire(act); }}
          style={{width:"100%",padding:"13px",borderRadius:11,border:"none",background:C.brand,color:"white",fontWeight:700,fontSize:14.5,cursor:"pointer",fontFamily:F.body,display:"flex",alignItems:"center",justifyContent:"center",gap:9,marginBottom:18,boxShadow:"0 4px 14px rgba(15,107,92,0.28)"}}>
          ✉️ Send an enquiry
        </button>
      )}
      <p style={{fontSize:14,color:C.slate600,lineHeight:1.75,margin:"0 0 20px"}}>{act.description}</p>
      {(()=>{const av=availFresh(act.availability);if(!av)return null;return(
        <div style={{display:"flex",alignItems:"center",gap:8,background:av.bg,borderRadius:10,padding:"10px 14px",marginBottom:16}}>
          <span style={{color:av.color,fontSize:15}}>●</span>
          <span style={{fontWeight:700,color:av.color,fontSize:13.5}}>{av.label}</span>
          <span style={{fontSize:12,color:C.slate400,marginLeft:"auto"}}>updated {agoLabel(av.updatedAt)}</span>
        </div>
      );})()}
      {(()=>{const sess=upcomingSessions(act);if(!sess.length)return null;return(
        <div style={{marginBottom:20}}>
          <p style={{margin:"0 0 10px",fontSize:11,fontWeight:700,color:"#6D28D9",textTransform:"uppercase",letterSpacing:"0.07em"}}>🗓️ Holiday clubs</p>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {sess.map((s,i)=>(
              <div key={s.id||i} style={{border:"1px solid #E9E3FB",background:"#FAF8FF",borderRadius:10,padding:"11px 14px",display:"flex",alignItems:"center",gap:12}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:600,fontSize:13.5,color:C.slate900}}>{s.name||"Holiday club"}</div>
                  <div style={{fontSize:12,color:C.slate500,marginTop:2}}>{fmtSessionDates(s)}{(s.ageMin||s.ageMax)?` · Ages ${s.ageMin||0}–${s.ageMax||18}`:""}</div>
                </div>
                {s.places&&<span style={{flexShrink:0,fontSize:11.5,fontWeight:700,color:"#6D28D9",background:"#EDE9FE",borderRadius:6,padding:"3px 9px"}}>{s.places} places</span>}
              </div>
            ))}
          </div>
        </div>
      );})()}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20}}>
        {[["Location",`${act.location}${act.postcode?` (${act.postcode})`:""}`.trim()],["Age Range",`${act.ageMin??0}–${act.ageMax??18} years`],["Cost",act.cost||"Contact for pricing"],["Days",(act.days||[]).join(", ")||null],["Time",act.time||null]].filter(([,v])=>v).map(([l,v])=>(
          <div key={l} style={{background:C.slate50,borderRadius:11,padding:"13px 14px",border:`1px solid ${C.slate100}`}}>
            <div style={{fontSize:10.5,color:C.slate400,fontWeight:700,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.1em"}}>{l}</div>
            <div style={{fontSize:13.5,fontWeight:600,color:C.slate700}}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{marginBottom:14}}>
        <p style={{margin:"0 0 8px",fontSize:11,fontWeight:700,color:C.slate500,textTransform:"uppercase",letterSpacing:"0.07em"}}>Accessibility</p>
        <div style={{display:"flex",flexWrap:"wrap"}}>{(act.accessibility||act.access||[]).map(a=><Tag key={a} color={C.brand}>{a}</Tag>)}</div>
        <a href="https://www.changing-places.org/find" target="_blank" rel="noopener noreferrer"
          style={{display:"inline-flex",alignItems:"center",gap:7,marginTop:10,fontSize:12.5,fontWeight:600,color:"#5B21B6",textDecoration:"none",background:"#F3EEFF",border:"1px solid #DDD3FB",borderRadius:8,padding:"6px 12px"}}>
          <span style={{width:18,height:18,borderRadius:"50%",background:"#5B21B6",display:"inline-flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Icons.accessible/></span>
          Find a Changing Places toilet near {act.postcode||act.location||"here"} ↗
        </a>
      </div>
      <div style={{marginBottom:14}}>
        <p style={{margin:"0 0 8px",fontSize:11,fontWeight:700,color:C.slate500,textTransform:"uppercase",letterSpacing:"0.07em"}}>Needs Supported</p>
        <div style={{display:"flex",flexWrap:"wrap"}}>{act.needs.map(n=><Tag key={n}>{n}</Tag>)}</div>
      </div>
      <div style={{marginBottom:24}}>
        <p style={{margin:"0 0 8px",fontSize:11,fontWeight:700,color:C.slate500,textTransform:"uppercase",letterSpacing:"0.07em"}}>Funding</p>
        {(act.funding||[]).length>0&&<div style={{display:"flex",flexWrap:"wrap"}}>{(act.funding||[]).map(f=><Tag key={f} color={C.green}>{f}</Tag>)}</div>}
      </div>
      <div style={{background:C.slate50,borderRadius:10,padding:18,border:`1px solid ${C.slate200}`}}>
        <p style={{margin:"0 0 12px",fontSize:11,fontWeight:700,color:C.slate500,textTransform:"uppercase",letterSpacing:"0.07em"}}>Contact</p>
        <p style={{margin:"0 0 10px",fontWeight:600,color:C.slate800,fontSize:14}}>{act.contactName}</p>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {act.website&&<a href={act.website} target="_blank" rel="noopener noreferrer" style={{display:"flex",alignItems:"center",gap:8,color:C.brand,fontSize:13,fontWeight:600,textDecoration:"none"}}><svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>{act.website.replace(/https?:\/\/www\./,"").replace(/https?:\/\//,"")}</a>}
          <a href={`tel:${act.contactPhone}`} style={{display:"flex",alignItems:"center",gap:8,color:C.brand,fontSize:13,fontWeight:600,textDecoration:"none"}}><Icons.phone/>{act.contactPhone}</a>
          <a href={`mailto:${act.contactEmail}`} style={{display:"flex",alignItems:"center",gap:8,color:C.brand,fontSize:13,fontWeight:600,textDecoration:"none"}}><Icons.mail/>{act.contactEmail}</a>
        </div>
      </div>
      {/* ── Share strip ── */}
      <div style={{display:"flex",alignItems:"center",gap:10,padding:"12px 0",borderBottom:`1px solid ${C.slate100}`,marginBottom:4}}>
        <span style={{fontSize:13,color:C.slate500,flex:1}}>Know a family who'd love this?</span>
        <button onClick={()=>waShare(act)}
          style={{display:"flex",alignItems:"center",gap:7,padding:"8px 16px",borderRadius:9,border:"none",background:"#25D366",color:"white",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:F.body,boxShadow:"0 2px 8px rgba(37,211,102,0.35)"}}>
          <Icons.wa/> Share on WhatsApp
        </button>
      </div>

      {/* ── Claim CTA (seed listings not yet owned) — organisations only ── */}
      {user&&user.accountType==="business"&&(act.ownerId==="seed"||!act.ownerId)&&(
        <div style={{border:`1px dashed ${C.slate200}`,borderRadius:12,padding:"14px 16px",marginBottom:20,display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,background:C.slate50}}>
          <div>
            <div style={{fontWeight:600,fontSize:13.5,color:C.slate700,marginBottom:2}}>Is this your organisation?</div>
            <div style={{fontSize:12.5,color:C.slate400}}>Claim this listing to manage details, photos and reviews.</div>
          </div>
          <Btn variant="secondary" size="sm" onClick={()=>setShowClaim(true)} style={{flexShrink:0}}>Claim listing →</Btn>
        </div>
      )}
      <p style={{margin:"14px 0 0",fontSize:11.5,color:C.slate400,lineHeight:1.5}}>ℹ️ Information only — details can change. Please confirm with the provider before attending, especially around accessibility or safety. <span onClick={()=>setShowReport(true)} style={{color:C.brand,fontWeight:600,cursor:"pointer",textDecoration:"underline"}}>Spotted something wrong?</span></p>
      <ReviewsSection actId={act.id} user={user} onReviewChange={onReviewChange} isOwner={!!(user&&act.ownerId&&act.ownerId===user.id)} orgName={act.organisation}/>
    </Modal>
  );
};

// ─── Map View ─────────────────────────────────────────────────────────────────
const MapView=({activities,userLoc,distRadius,onOpen})=>{
  const containerRef=useRef(null);
  const mapRef=useRef(null);
  const markersRef=useRef([]);
  const [mapReady,setMapReady]=useState(false);
  const [loadErr,setLoadErr]=useState(false);
  useEffect(()=>{
    if(window.L){setMapReady(true);return;}
    const css=document.createElement("link");css.rel="stylesheet";css.href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";document.head.appendChild(css);
    const script=document.createElement("script");script.src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";script.onload=()=>setMapReady(true);script.onerror=()=>setLoadErr(true);document.head.appendChild(script);
  },[]);
  useEffect(()=>{
    if(!mapReady||!containerRef.current||mapRef.current)return;
    const center=userLoc?[userLoc.lat,userLoc.lng]:[52.5,-1.5];
    const map=window.L.map(containerRef.current,{zoomControl:true}).setView(center,userLoc?8:6);
    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:'© <a href="https://www.openstreetmap.org/copyright">OSM</a>',maxZoom:18}).addTo(map);
    mapRef.current=map;

    // Leaflet caches the container's pixel size at creation time and does
    // NOT automatically notice later size changes — e.g. rotating the
    // device. Without calling invalidateSize() after that, the map keeps
    // rendering tiles/markers positioned for the OLD dimensions, which is
    // what caused the broken/overlapping map after rotating. A short delay
    // is needed because the container doesn't reach its final rotated size
    // until slightly after the resize/orientationchange event fires.
    const handleResize=()=>{ setTimeout(()=>{ if(mapRef.current)mapRef.current.invalidateSize(); },200); };
    window.addEventListener("resize",handleResize);
    window.addEventListener("orientationchange",handleResize);
    return()=>{
      window.removeEventListener("resize",handleResize);
      window.removeEventListener("orientationchange",handleResize);
    };
  },[mapReady]);
  useEffect(()=>{
    if(!mapReady||!mapRef.current||!userLoc)return;
    const L=window.L,map=mapRef.current;
    if(map._uc){map._uc.remove();map._ucm?.remove();}
    if(distRadius)map._uc=L.circle([userLoc.lat,userLoc.lng],{radius:distRadius*1609.34,color:C.brand,fillColor:C.brand,fillOpacity:0.06,weight:2,dashArray:"6 4"}).addTo(map);
    map._ucm=L.circleMarker([userLoc.lat,userLoc.lng],{radius:7,color:C.brand,fillColor:C.brand,fillOpacity:1,weight:2.5}).addTo(map).bindPopup("📍 Your search location");
  },[mapReady,userLoc,distRadius]);
  useEffect(()=>{
    if(!mapReady||!mapRef.current)return;
    const L=window.L;
    markersRef.current.forEach(m=>m.remove());markersRef.current=[];
    activities.forEach(act=>{
      if(!act.lat||!act.lng)return;
      const tc=getType(act.type);
      const dist=userLoc?haversine(userLoc.lat,userLoc.lng,act.lat,act.lng):null;
      const icon=L.divIcon({className:"",html:`<div style="background:${tc.bg};color:${tc.col};border:2px solid ${tc.col};border-radius:50% 50% 50% 0;width:34px;height:34px;display:flex;align-items:center;justify-content:center;font-size:15px;box-shadow:0 3px 10px rgba(0,0,0,0.18);transform:rotate(-45deg)"><span style="transform:rotate(45deg)">${tc.icon}</span></div>`,iconSize:[34,34],iconAnchor:[17,34],popupAnchor:[0,-38]});
      const marker=L.marker([act.lat,act.lng],{icon}).addTo(mapRef.current);
      const distStr=dist!=null?`<span style="background:#FEF3C7;color:#92400E;border-radius:99px;padding:2px 8px;font-size:11px;font-weight:600">${fmtDist(dist)} away</span>`:"";
      marker.bindPopup(`<div style="min-width:190px;font-family:'Hanken Grotesk',system-ui,sans-serif"><div style="font-weight:700;font-size:15px;color:#1A1712;margin-bottom:2px;font-family:'Fraunces',Georgia,serif">${act.name}</div><div style="font-size:12px;color:#948D7E;margin-bottom:8px">${act.organisation}</div>${distStr}<div style="margin-top:10px;display:flex;gap:6px;flex-wrap:wrap"><span style="background:${tc.bg};color:${tc.col};border-radius:7px;padding:3px 9px;font-size:11px;font-weight:700">${act.type}</span><span style="background:#F0EEE7;color:#514B40;border-radius:7px;padding:3px 9px;font-size:11px;font-weight:700">Ages ${act.ageMin}–${act.ageMax}</span></div><button onclick="window._im_open('${act.id}')" style="margin-top:11px;background:${C.brand};color:white;border:none;border-radius:9px;padding:8px 14px;font-size:12px;font-weight:600;cursor:pointer;width:100%;font-family:'Hanken Grotesk',system-ui,sans-serif">View Details →</button></div>`);
      markersRef.current.push(marker);
    });
    window._im_open=id=>{const act=activities.find(a=>a.id===id);if(act)onOpen(act);};
  },[mapReady,activities,userLoc]);
  if(loadErr)return <div style={{height:480,display:"flex",alignItems:"center",justifyContent:"center",background:C.slate50,borderRadius:12,flexDirection:"column",gap:12}}><div style={{fontSize:36}}>🗺️</div><p style={{color:C.slate400,fontWeight:500,fontSize:14}}>Map could not be loaded.</p></div>;
  return(
    <div style={{borderRadius:12,overflow:"hidden",boxShadow:SHADOW.md,border:`1px solid ${C.slate100}`}}>
      {!mapReady&&<div style={{height:480,display:"flex",alignItems:"center",justifyContent:"center",background:C.slate50,flexDirection:"column",gap:12}}><div style={{width:32,height:32,border:`3px solid ${C.brandLt}`,borderTop:`3px solid ${C.brand}`,borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/><p style={{color:C.slate400,fontSize:13,fontWeight:500}}>Loading map…</p></div>}
      <div ref={containerRef} style={{height:480,width:"100%",display:mapReady?"block":"none"}}/>
      <div style={{background:C.white,padding:"10px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",borderTop:`1px solid ${C.slate100}`}}>
        <span style={{fontSize:13,color:C.slate500,fontWeight:500}}>{activities.filter(a=>a.lat).length} activities shown on map</span>
        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
          {Object.entries(typeConfig).slice(0,5).map(([t,v])=><span key={t} style={{fontSize:11,color:C.slate500,display:"flex",alignItems:"center",gap:3}}>{v.icon} {t}</span>)}
        </div>
      </div>
    </div>
  );
};

// ─── Auth Modal ───────────────────────────────────────────────────────────────
// ─── Social sign-in + reset (shared by both auth screens) ─────────────────────

const PrivacyPolicyModal=({onClose})=>(
  <Modal onClose={onClose} maxWidth={620}>
    <h2 style={{margin:"0 0 4px",fontFamily:F.display,fontSize:20,fontWeight:600,color:C.slate900}}>Privacy Policy</h2>
    <p style={{margin:"0 0 20px",fontSize:12,color:C.slate400}}>Last updated: June 2026</p>
    {[
      ["Who we are","IncludeMe is a UK directory of SEND (Special Educational Needs and Disabilities) activities and therapies. The data controller is the operator of includeme.uk. For data queries email: hello@includeme.uk"],
      ["What data we collect","When you create an account we collect your name and email address. We also store your saved listings (favourites), filter presets, reviews you write, and any messages you send to providers via \"Enquire\" (which may include a phone number and details about your situation). If you write a review or message a provider, what you choose to share there — including anything about a child's needs — may incidentally include health or disability information; we only use it for the feature you used it for, never for advertising."],
      ["How we use it","Your data is used to provide the service — logging you in, saving your preferences, passing your enquiries to the provider you contacted, and letting you manage listings you own. We do not sell your data or share it with advertisers."],
      ["Lawful basis","Processing is based on the performance of a contract (providing the service you signed up for) and, for communications, your consent."],
      ["How long we keep it","We retain your account data for as long as your account is active. You can delete your account at any time by emailing hello@includeme.uk — all personal data will be removed within 30 days."],
      ["Your rights","Under UK GDPR you have the right to: access the data we hold about you · correct inaccurate data · request deletion · receive a copy in a portable format · withdraw consent at any time. To exercise any right, email hello@includeme.uk."],
      ["Cookies","We use only strictly necessary session cookies to keep you logged in. No advertising or analytics cookies are used."],
      ["Security","Passwords are never stored by us — authentication is handled by Supabase, an enterprise-grade platform with encryption at rest and in transit."],
      ["Contact & complaints","For any privacy concern contact hello@includeme.uk. You also have the right to lodge a complaint with the ICO at ico.org.uk."],
    ].map(([title,body])=>(
      <div key={title} style={{marginBottom:16}}>
        <div style={{fontSize:12,fontWeight:700,color:C.slate700,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:4}}>{title}</div>
        <p style={{margin:0,fontSize:13,color:C.slate500,lineHeight:1.65}}>{body}</p>
      </div>
    ))}
    <div style={{marginTop:20}}><Btn onClick={onClose}>Close</Btn></div>
  </Modal>
);

// Shown when Supabase fires PASSWORD_RECOVERY (the person clicked the reset
// link in their email). Cannot be dismissed by clicking outside — they're in
// a temporary recovery session specifically to do this, and clicking away
// without setting a password would leave them confused why "nothing changed."
const SetNewPasswordModal=({onClose})=>{
  const [pw,setPw]=useState("");
  const [pw2,setPw2]=useState("");
  const [err,setErr]=useState("");
  const [loading,setLoading]=useState(false);
  const [done,setDone]=useState(false);
  const submit=async()=>{
    setErr("");
    if(pw.length<6){setErr("Password must be at least 6 characters.");return;}
    if(pw!==pw2){setErr("Passwords don't match.");return;}
    setLoading(true);
    try{
      const{error}=await sb.auth.updateUser({password:pw});
      if(error){setErr(error.message||"Something went wrong — please try again or request a new reset link.");}
      else setDone(true);
    }catch{setErr("Something went wrong — please try again or request a new reset link.");}
    setLoading(false);
  };
  return(
    <Modal onClose={done?onClose:undefined} maxWidth={400}>
      {done?(
        <div style={{textAlign:"center",padding:"8px 0"}}>
          <div style={{fontSize:40,marginBottom:12}}>✅</div>
          <h3 style={{margin:"0 0 8px",fontFamily:F.display,fontWeight:700,fontSize:19,color:C.slate900}}>Password updated</h3>
          <p style={{color:C.slate500,fontSize:13.5,lineHeight:1.6,margin:"0 0 18px"}}>You're all set — you're signed in with your new password.</p>
          <Btn full onClick={onClose}>Continue to IncludeMe →</Btn>
        </div>
      ):(
        <>
          <h2 style={{margin:"0 0 6px",fontSize:19,fontWeight:700,color:C.slate900,fontFamily:F.display}}>Set a new password</h2>
          <p style={{margin:"0 0 18px",fontSize:13,color:C.slate500}}>Choose a new password for your IncludeMe account.</p>
          <Input label="New password" type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="At least 6 characters"/>
          <Input label="Confirm new password" type="password" value={pw2} onChange={e=>setPw2(e.target.value)} placeholder="Re-enter your new password"/>
          {err&&<p style={{color:C.red,fontSize:12.5,margin:"0 0 10px"}}>{err}</p>}
          <Btn full loading={loading} onClick={submit}>Set new password →</Btn>
        </>
      )}
    </Modal>
  );
};

const TermsModal=({onClose})=>(
  <Modal onClose={onClose} maxWidth={620}>
    <h2 style={{margin:"0 0 4px",fontFamily:F.display,fontSize:20,fontWeight:600,color:C.slate900}}>Terms of Service</h2>
    <p style={{margin:"0 0 16px",fontSize:12,color:C.slate400}}>Last updated: June 2026</p>
    <div style={{background:C.brandLt,borderLeft:`3px solid ${C.brand}`,borderRadius:8,padding:"12px 14px",marginBottom:20}}>
      <div style={{fontSize:12.5,fontWeight:700,color:C.brand,marginBottom:4}}>Listings are information only — please always check before you go</div>
      <p style={{margin:0,fontSize:12.5,color:C.slate600,lineHeight:1.6}}>We work hard to keep listings accurate, but details like opening times, costs, accessibility features and contact information can change, and not every listing has been independently verified. Always confirm with the provider — especially anything related to accessibility, staffing, or safety — before attending or relying on this information. Spotted something wrong? Use the "Report" option so we can fix it.</p>
    </div>
    {[
      ["What IncludeMe is","IncludeMe is a directory. We list information about activities, therapy providers and charities — submitted by us, by the organisations themselves, or sourced from public information. We do not run, staff, supervise or directly vet listed organisations unless stated otherwise. A \"Verified\" or \"Featured\" badge reflects registration/payment for that tier — it is not a safety certification or DBS check."],
      ["Accounts","You need an account to save favourites, leave reviews, message providers, or list an organisation. You're responsible for keeping your login secure and for the accuracy of information you provide."],
      ["Reviews and content you post","You're responsible for what you post. Don't post anything false, defamatory, abusive, harassing, or that reveals private information about a child or other person without consent. We may remove content or restrict/block accounts that break these rules. You can report content you think is inappropriate."],
      ["Organisations & listings","If you claim or create a listing, you confirm you're authorised to and that the information is accurate to your knowledge. Verified/Featured tiers are paid promotional placements. We can remove or downgrade a listing at our discretion, including if information turns out to be inaccurate."],
      ["Safeguarding","IncludeMe is not a safeguarding or emergency service. For an urgent welfare or safety concern about a child, contact emergency services or your local authority directly — not this app."],
      ["No liability for listing accuracy","To the fullest extent permitted by law, we're not liable for losses arising from inaccurate or outdated listing information, or your dealings with any organisation found through the Service. The Service is provided \"as is.\""],
      ["Changes & termination","We may update these terms and will post the new version with an updated date. We may suspend accounts that violate these terms; you can close your account at any time."],
      ["Governing law & contact","These terms are governed by the laws of England and Wales. Questions: hello@includeme.uk."],
    ].map(([title,body])=>(
      <div key={title} style={{marginBottom:16}}>
        <div style={{fontSize:12,fontWeight:700,color:C.slate700,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:4}}>{title}</div>
        <p style={{margin:0,fontSize:13,color:C.slate500,lineHeight:1.65}}>{body}</p>
      </div>
    ))}
    <div style={{marginTop:20}}><Btn onClick={onClose}>Close</Btn></div>
  </Modal>
);

const AuthModal=({onClose,onAuth})=>{
  const [mode,setMode]=useState("login");
  const [accountType,setAccountType]=useState("individual");
  const [form,setForm]=useState({name:"",email:"",password:"",orgName:""});
  const [showPw,setShowPw]=useState(false);
  const [err,setErr]=useState("");
  const [loading,setLoading]=useState(false);
  const [privacyAccepted,setPrivacyAccepted]=useState(false);
  const [showPrivacy,setShowPrivacy]=useState(false);
  const [showTerms,setShowTerms]=useState(false);
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const submit=async()=>{
    setErr("");setLoading(true);
    try{
      if(mode==="signup"){
        if(!form.name||!form.email||!form.password){setErr("Please fill in all required fields.");setLoading(false);return;}
        if(form.password.length<6){setErr("Password must be at least 6 characters.");setLoading(false);return;}
        if(!privacyAccepted){setErr("Please accept the Privacy Policy and Terms of Service to continue.");setLoading(false);return;}
        const {data}=await auth.signUp({email:form.email,password:form.password,name:form.name,accountType,orgName:accountType==="business"?form.orgName:undefined});
        if(data.session){const u=await ensureProfileSafe(data.user);onAuth(u);}else{setErr("Account created! Check your email to confirm your address, then sign in.");setMode("login");}
      }else{
        if(!form.email||!form.password){setErr("Please enter your email and password.");setLoading(false);return;}
        const {data}=await auth.signIn({email:form.email,password:form.password});
        const u=await ensureProfileSafe(data.user);onAuth(u);
      }
    }catch(e){setErr(e?.message||"Something went wrong. Please try again.");}
    setLoading(false);
  };
  return(
    <Modal onClose={onClose} maxWidth={420}>
      {showPrivacy&&<PrivacyPolicyModal onClose={()=>setShowPrivacy(false)}/>}
      {showTerms&&<TermsModal onClose={()=>setShowTerms(false)}/>}
      <h2 style={{margin:"0 0 4px",fontSize:20,fontWeight:700,color:C.slate900,fontFamily:F.display,paddingRight:32}}>{mode==="login"?"Welcome back":"Create your account"}</h2>
      <p style={{margin:"0 0 24px",fontSize:13,color:C.slate400}}>{mode==="login"?"Sign in to continue to IncludeMe":"Join thousands of families finding inclusive activities"}</p>
      {mode==="signup"&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20}}>
          {[["individual","👤","Carer / Parent"],["business","🏢","Organisation"]].map(([val,emoji,lbl])=>(
            <button key={val} onClick={()=>setAccountType(val)} style={{padding:"14px 10px",borderRadius:10,border:`1.5px solid ${accountType===val?C.brand:C.slate200}`,background:accountType===val?C.brandLt:C.white,cursor:"pointer",textAlign:"center",transition:"all 0.15s"}}>
              <div style={{fontSize:20,marginBottom:4}}>{emoji}</div>
              <div style={{fontSize:12,fontWeight:600,color:accountType===val?C.brand:C.slate600}}>{lbl}</div>
            </button>
          ))}
        </div>
      )}
      {mode==="signup"&&<Input label="Full Name" placeholder="Your name" value={form.name} onChange={e=>set("name",e.target.value)}/>}
      {mode==="signup"&&accountType==="business"&&<Input label="Organisation Name" value={form.orgName} onChange={e=>set("orgName",e.target.value)}/>}
      <Input label="Email Address" type="email" placeholder="you@example.com" value={form.email} onChange={e=>set("email",e.target.value)}/>
      {mode==="login"&&<div style={{textAlign:"right",marginTop:6,marginBottom:2}}><button onClick={()=>doReset(form.email,setErr)} style={{background:"none",border:"none",color:C.brand,fontWeight:600,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Forgot password?</button></div>}
      <Field label="Password">
        <div style={{position:"relative"}}>
          <input type={showPw?"text":"password"} placeholder={mode==="signup"?"Min. 6 characters":""} value={form.password} onChange={e=>set("password",e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()} style={{...inputStyle,paddingRight:40}}/>
          <button onClick={()=>setShowPw(v=>!v)} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:C.slate400,padding:0,lineHeight:0}}>{showPw?<Icons.eyeOff/>:<Icons.eye/>}</button>
        </div>
      </Field>
      {mode==="signup"&&(
        <label style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:16,cursor:"pointer"}}>
          <input type="checkbox" checked={privacyAccepted} onChange={e=>setPrivacyAccepted(e.target.checked)} style={{marginTop:2,width:15,height:15,flexShrink:0,accentColor:C.brand}}/>
          <span style={{fontSize:12.5,color:C.slate500,lineHeight:1.5}}>I have read and agree to the <button onClick={e=>{e.preventDefault();setShowPrivacy(true);}} style={{background:"none",border:"none",color:C.brand,fontWeight:600,cursor:"pointer",fontSize:12.5,padding:0,textDecoration:"underline"}}>Privacy Policy</button> and <button onClick={e=>{e.preventDefault();setShowTerms(true);}} style={{background:"none",border:"none",color:C.brand,fontWeight:600,cursor:"pointer",fontSize:12.5,padding:0,textDecoration:"underline"}}>Terms of Service</button></span>
        </label>
      )}
      {err&&<div style={{background:"#FEF2F2",border:`1px solid #FECACA`,color:C.red,padding:"10px 14px",borderRadius:8,fontSize:13,fontWeight:500,marginBottom:16}}>{err}</div>}
      <Btn full size="lg" onClick={submit} loading={loading}>{mode==="login"?"Sign In":"Create Account"}</Btn>
      <p style={{textAlign:"center",fontSize:13,color:C.slate400,marginTop:16,marginBottom:0}}>
        {mode==="login"?"Don't have an account? ":"Already have an account? "}
        <button onClick={()=>{setMode(mode==="login"?"signup":"login");setErr("");}} style={{background:"none",border:"none",color:C.brand,fontWeight:600,cursor:"pointer",fontSize:13}}>{mode==="login"?"Create one free":"Sign in"}</button>
      </p>
    </Modal>
  );
};

// ─── Activity Form ────────────────────────────────────────────────────────────
// ─── Image downscaling (keeps uploaded photos small enough for KV storage) ────
function downscaleImage(file,maxDim=1000,quality=0.7){
  return new Promise((resolve,reject)=>{
    const reader=new FileReader();
    reader.onload=()=>{
      const img=new Image();
      img.onload=()=>{
        let{width,height}=img;
        if(width>maxDim||height>maxDim){
          if(width>=height){height=Math.round(height*maxDim/width);width=maxDim;}
          else{width=Math.round(width*maxDim/height);height=maxDim;}
        }
        const canvas=document.createElement("canvas");canvas.width=width;canvas.height=height;
        canvas.getContext("2d").drawImage(img,0,0,width,height);
        try{resolve(canvas.toDataURL("image/jpeg",quality));}catch(e){reject(e);}
      };
      img.onerror=reject;img.src=reader.result;
    };
    reader.onerror=reject;reader.readAsDataURL(file);
  });
}

const ActivityForm=({onClose,onSave,initial,user})=>{
  const blank={name:"",organisation:user?.orgName||"",type:"Swimming",location:"",postcode:"",lat:"",lng:"",description:"",ageMin:"",ageMax:"",cost:"",days:[],needs:[],accessibility:[],funding:[],contactName:user?.name||"",contactEmail:user?.email||"",contactPhone:"",contactWebsite:"",time:"",photos:[],availability:null,sessions:[]};
  const [form,setForm]=useState(initial?{...initial,lat:initial.lat||"",lng:initial.lng||"",contactWebsite:initial.website||"",photos:initial.photos||[],availability:initial.availability||null,sessions:initial.sessions||[]}:blank);
  const [step,setStep]=useState(1);
  const [done,setDone]=useState(false);
  const [photoUrl,setPhotoUrl]=useState("");
  const [photoErr,setPhotoErr]=useState("");
  const MAX_PHOTOS=6;
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const tog=(k,v)=>setForm(f=>({...f,[k]:f[k].includes(v)?f[k].filter(x=>x!==v):[...f[k],v]}));
  const addFiles=async(files)=>{
    setPhotoErr("");
    const room=MAX_PHOTOS-(form.photos?.length||0);
    const list=Array.from(files).filter(f=>f.type.startsWith("image/")).slice(0,room);
    for(const file of list){
      try{const dataUrl=await downscaleImage(file);setForm(f=>({...f,photos:[...(f.photos||[]),dataUrl].slice(0,MAX_PHOTOS)}));}
      catch{setPhotoErr("Couldn't process one of those images — try another.");}
    }
  };
  const addUrl=()=>{const u=photoUrl.trim();if(!u)return;setForm(f=>({...f,photos:[...(f.photos||[]),u].slice(0,MAX_PHOTOS)}));setPhotoUrl("");};
  const makeCover=i=>setForm(f=>{const ps=[...(f.photos||[])];const[m]=ps.splice(i,1);ps.unshift(m);return{...f,photos:ps};});
  const removePhoto=i=>setForm(f=>({...f,photos:(f.photos||[]).filter((_,j)=>j!==i)}));
  const setAvail=status=>setForm(f=>({...f,availability:status?{status,updatedAt:new Date().toISOString()}:null}));
  const addSession=()=>setForm(f=>({...f,sessions:[...(f.sessions||[]),{id:`s-${Date.now()}`,name:"",start:"",end:"",ageMin:f.ageMin||"",ageMax:f.ageMax||"",places:""}]}));
  const setSession=(i,k,v)=>setForm(f=>({...f,sessions:(f.sessions||[]).map((s,j)=>j===i?{...s,[k]:v}:s)}));
  const removeSession=i=>setForm(f=>({...f,sessions:(f.sessions||[]).filter((_,j)=>j!==i)}));
  const handleSave=async()=>{
    const isNew=!initial;
    const act={...form,id:initial?.id||`act-${Date.now()}`,ageMin:parseInt(form.ageMin)||0,ageMax:parseInt(form.ageMax)||18,lat:parseFloat(form.lat)||undefined,lng:parseFloat(form.lng)||undefined,website:form.contactWebsite||undefined,ownerId:user.id,verified:initial?.verified||false,createdAt:initial?.createdAt||new Date().toISOString()};
    await store.set(`activity:${act.id}`,act);
    // If this is a brand-new listing (not an edit), publish it to the
    // notification feed so nearby families get a weekly email / push about it.
    // Best-effort: never block saving the listing on this.
    if(isNew){
      try{
        const{data:{session}}=await sb.auth.getSession();
        if(session?.access_token){
          await fetch(`${API_BASE}/.netlify/functions/publish-new-listings`,{
            method:"POST",
            headers:{"Content-Type":"application/json",Authorization:`Bearer ${session.access_token}`},
            body:JSON.stringify({mode:"live",listings:[{id:act.id,name:act.name,location:act.location,type:act.type,category:act.category,lat:act.lat,lng:act.lng,description:act.description,cost:act.cost,ageMin:act.ageMin,ageMax:act.ageMax,needs:act.needs}]})
          });
        }
      }catch{ /* feed publish is non-critical — listing is already saved */ }
    }
    onSave(act);setDone(true);
    // Detect newly-added dated sessions (events) and publish them so nearby
    // families get notified. A session counts as new if its id wasn't in the
    // listing's previous sessions. Only dated sessions (with a start) qualify.
    try{
      const prevIds=new Set((initial?.sessions||[]).map(s=>s.id));
      const newSessions=(act.sessions||[]).filter(s=>s&&s.start&&!prevIds.has(s.id));
      if(newSessions.length){
        const{data:{session}}=await sb.auth.getSession();
        if(session?.access_token){
          await fetch(`${API_BASE}/.netlify/functions/publish-new-listings`,{
            method:"POST",
            headers:{"Content-Type":"application/json",Authorization:`Bearer ${session.access_token}`},
            body:JSON.stringify({mode:"live",events:newSessions.map(s=>({id:`${act.id}__${s.id}`,listingId:act.id,listingName:act.name,name:s.name||"New session",start:s.start,end:s.end,location:act.location,lat:act.lat,lng:act.lng}))})
          });
        }
      }
    }catch{ /* event publish is non-critical */ }
  };
  if(done)return(
    <Modal onClose={onClose} maxWidth={380}>
      <div style={{textAlign:"center",padding:"20px 0"}}>
        <div style={{fontSize:48,marginBottom:16}}>🎉</div>
        <h2 style={{margin:"0 0 8px",fontFamily:F.display,color:C.slate900}}>{initial?"Listing Updated":"Listing Published"}</h2>
        <p style={{color:C.slate400,marginBottom:24,fontSize:14}}>{initial?"Your changes have been saved successfully.":"Your activity is now live on IncludeMe."}</p>
        <Btn onClick={onClose}>Back to Listings</Btn>
      </div>
    </Modal>
  );
  const stepLabels=["","Activity Details","Accessibility & Support","Contact & Funding"];
  return(
    <Modal onClose={onClose} maxWidth={640}>
      <h2 style={{margin:"0 0 4px",fontSize:20,fontWeight:700,color:C.slate900,fontFamily:F.display,paddingRight:32}}>{initial?"Edit Activity":"Add Your Activity"}</h2>
      <p style={{margin:"0 0 20px",fontSize:13,color:C.slate400}}>Step {step} of 3 — {stepLabels[step]}</p>
      <div style={{display:"flex",gap:4,marginBottom:24}}>
        {[1,2,3].map(s=><div key={s} style={{flex:1,height:4,borderRadius:99,background:s<=step?C.brand:C.slate100,transition:"background 0.3s"}}/>)}
      </div>
      {step===1&&<>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Input label="Activity Name" value={form.name} onChange={e=>set("name",e.target.value)} placeholder="e.g. Sensory Swimming"/>
          <Input label="Organisation" value={form.organisation} onChange={e=>set("organisation",e.target.value)}/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
          <Select label="Type" options={ACTIVITY_TYPES.slice(1)} value={form.type} onChange={e=>set("type",e.target.value)}/>
          <Input label="Town / City" value={form.location} onChange={e=>set("location",e.target.value)}/>
          <Input label="Postcode" value={form.postcode} onChange={e=>set("postcode",e.target.value)} placeholder="e.g. M1"/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:12}}>
          <Input label="Age From" type="number" value={form.ageMin} onChange={e=>set("ageMin",e.target.value)}/>
          <Input label="Age To" type="number" value={form.ageMax} onChange={e=>set("ageMax",e.target.value)}/>
          <Input label="Latitude" type="number" step="0.0001" value={form.lat} onChange={e=>set("lat",e.target.value)} placeholder="53.48"/>
          <Input label="Longitude" type="number" step="0.0001" value={form.lng} onChange={e=>set("lng",e.target.value)} placeholder="-2.24"/>
        </div>
        <Textarea label="Description" value={form.description} onChange={e=>set("description",e.target.value)} placeholder="Describe the activity and who it's for…"/>
        <Field label="Photos" sub=" — the first photo is the cover families see. Up to 6.">
          <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"flex-start"}}>
            {(form.photos||[]).map((p,i)=>(
              <div key={i} style={{position:"relative",width:86,height:86,borderRadius:10,overflow:"hidden",border:`1px solid ${C.slate200}`,flexShrink:0}}>
                <img src={p} alt="" style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
                {i===0&&<span style={{position:"absolute",bottom:3,left:3,background:"rgba(15,107,92,0.92)",color:"#fff",fontSize:9,fontWeight:700,borderRadius:4,padding:"1px 5px",letterSpacing:"0.03em"}}>COVER</span>}
                {i!==0&&<button type="button" onClick={()=>makeCover(i)} style={{position:"absolute",bottom:3,left:3,background:"rgba(255,255,255,0.92)",border:"none",borderRadius:4,fontSize:9,fontWeight:700,padding:"2px 5px",cursor:"pointer",color:C.slate700}}>Make cover</button>}
                <button type="button" onClick={()=>removePhoto(i)} style={{position:"absolute",top:3,right:3,width:19,height:19,borderRadius:"50%",border:"none",background:"rgba(0,0,0,0.6)",color:"#fff",fontSize:12,cursor:"pointer",lineHeight:1,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
              </div>
            ))}
            {(form.photos||[]).length<MAX_PHOTOS&&(
              <label style={{width:86,height:86,borderRadius:10,border:`1.5px dashed ${C.slate300}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",color:C.slate400,fontSize:11,gap:2,flexShrink:0}}>
                <span style={{fontSize:22,lineHeight:1}}>＋</span>Add photo
                <input type="file" accept="image/*" multiple style={{display:"none"}} onChange={e=>{addFiles(e.target.files);e.target.value="";}}/>
              </label>
            )}
          </div>
          {(form.photos||[]).length<MAX_PHOTOS&&(
            <div style={{display:"flex",gap:8,marginTop:10}}>
              <input style={{...inputStyle,marginBottom:0,flex:1}} placeholder="…or paste an image link (https://…)" value={photoUrl} onChange={e=>setPhotoUrl(e.target.value)} onKeyDown={e=>e.key==="Enter"&&(e.preventDefault(),addUrl())}/>
              <Btn type="button" variant="secondary" size="sm" onClick={addUrl} disabled={!photoUrl.trim()}>Add link</Btn>
            </div>
          )}
          {photoErr&&<p style={{color:C.red,fontSize:12,margin:"8px 0 0"}}>{photoErr}</p>}
        </Field>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Input label="Session Time" value={form.time} onChange={e=>set("time",e.target.value)} placeholder="10:00 – 11:30"/>
        </div>
        <Field label="Days Available"><ChipGroup items={DAYS_LIST} selected={form.days} onToggle={v=>tog("days",v)}/></Field>
        <Divider/>
        <Field label="Availability" sub=" — helps families know if you can take bookings. Auto-expires after 3 weeks so it never goes stale.">
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            <button type="button" onClick={()=>setAvail("")} style={{padding:"7px 12px",borderRadius:8,fontSize:12.5,fontWeight:600,cursor:"pointer",fontFamily:F.body,border:`1.5px solid ${!form.availability?.status?C.brand:C.slate200}`,background:!form.availability?.status?C.brandLt:C.white,color:!form.availability?.status?C.brand:C.slate500}}>Not set</button>
            {AVAIL_OPTS.map(o=>{const on=form.availability?.status===o.v;return(
              <button key={o.v} type="button" onClick={()=>setAvail(o.v)} style={{padding:"7px 12px",borderRadius:8,fontSize:12.5,fontWeight:600,cursor:"pointer",fontFamily:F.body,border:`1.5px solid ${on?o.color:C.slate200}`,background:on?o.bg:C.white,color:on?o.color:C.slate500}}>{o.label}</button>
            );})}
          </div>
          {form.availability?.updatedAt&&<p style={{fontSize:11.5,color:C.slate400,margin:"8px 0 0"}}>Set {agoLabel(form.availability.updatedAt)} — families will see this until it expires.</p>}
        </Field>
        <Field label="Holiday clubs" sub=" — add dated school-holiday clubs so families can find them and get notified.">
          {(form.sessions||[]).map((s,i)=>(
            <div key={s.id||i} style={{border:`1px solid ${C.slate200}`,borderRadius:10,padding:12,marginBottom:8,background:C.slate50}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <input style={{...inputStyle,marginBottom:0,flex:1,fontWeight:600}} placeholder="Club name (e.g. Easter Sensory Camp)" value={s.name} onChange={e=>setSession(i,"name",e.target.value)}/>
                <button type="button" onClick={()=>removeSession(i)} style={{marginLeft:8,background:"none",border:"none",color:C.red,cursor:"pointer",fontSize:18,lineHeight:1}}>×</button>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
                <div><label style={{fontSize:11,color:C.slate400,fontWeight:600,display:"block",marginBottom:3}}>Starts</label><input type="date" style={{...inputStyle,marginBottom:0}} value={s.start||""} onChange={e=>setSession(i,"start",e.target.value)}/></div>
                <div><label style={{fontSize:11,color:C.slate400,fontWeight:600,display:"block",marginBottom:3}}>Ends</label><input type="date" style={{...inputStyle,marginBottom:0}} value={s.end||""} onChange={e=>setSession(i,"end",e.target.value)}/></div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                <div><label style={{fontSize:11,color:C.slate400,fontWeight:600,display:"block",marginBottom:3}}>Age from</label><input type="number" style={{...inputStyle,marginBottom:0}} value={s.ageMin||""} onChange={e=>setSession(i,"ageMin",e.target.value)}/></div>
                <div><label style={{fontSize:11,color:C.slate400,fontWeight:600,display:"block",marginBottom:3}}>Age to</label><input type="number" style={{...inputStyle,marginBottom:0}} value={s.ageMax||""} onChange={e=>setSession(i,"ageMax",e.target.value)}/></div>
                <div><label style={{fontSize:11,color:C.slate400,fontWeight:600,display:"block",marginBottom:3}}>Places</label><input type="number" style={{...inputStyle,marginBottom:0}} placeholder="opt." value={s.places||""} onChange={e=>setSession(i,"places",e.target.value)}/></div>
              </div>
            </div>
          ))}
          <button type="button" onClick={addSession} style={{display:"flex",alignItems:"center",gap:6,padding:"9px 14px",borderRadius:9,border:`1.5px dashed ${C.slate300}`,background:C.white,color:C.brand,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:F.body}}>＋ Add a holiday club</button>
        </Field>
      </>}
      {step===2&&<>
        <Field label="Needs Supported" sub=" — select all that apply"><ChipGroup items={NEEDS_LIST} selected={form.needs} onToggle={v=>tog("needs",v)}/></Field>
        <Field label="Accessibility Features"><ChipGroup items={ACCESS_LIST} selected={form.accessibility} onToggle={v=>tog("accessibility",v)} color="#5B21B6"/></Field>
      </>}
      {step===3&&<>
        <Input label="Session Cost" value={form.cost} onChange={e=>set("cost",e.target.value)} placeholder="e.g. £5 per session, or Free"/>
        <Field label="Funding Options"><ChipGroup items={FUNDING_LIST} selected={form.funding} onToggle={v=>tog("funding",v)} color={C.green}/></Field>
        <Divider/>
        <Input label="Contact Name" value={form.contactName} onChange={e=>set("contactName",e.target.value)}/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Input label="Email" type="email" value={form.contactEmail} onChange={e=>set("contactEmail",e.target.value)}/>
          <Input label="Phone" type="tel" value={form.contactPhone} onChange={e=>set("contactPhone",e.target.value)}/>
        </div>
        <Input label="Website URL" type="url" placeholder="https://yourorganisation.org.uk" value={form.contactWebsite} onChange={e=>set("contactWebsite",e.target.value)}/>
      </>}
      <div style={{display:"flex",justifyContent:"space-between",marginTop:8,paddingTop:20,borderTop:`1px solid ${C.slate100}`}}>
        {step>1?<Btn variant="secondary" onClick={()=>setStep(s=>s-1)}>← Back</Btn>:<div/>}
        {step<3?<Btn onClick={()=>setStep(s=>s+1)}>Next →</Btn>:<Btn variant="green" onClick={handleSave}><Icons.check/>{initial?"Save Changes":"Publish Listing"}</Btn>}
      </div>
    </Modal>
  );
};

// ─── Business Dashboard ───────────────────────────────────────────────────────
const Dashboard=({user,activities,onEdit,onDelete,onAdd,onClose})=>{
  const mine=activities.filter(a=>a.ownerId===user.id);
  return(
    <Modal onClose={onClose} maxWidth={700}>
      <div style={{display:"flex",gap:14,alignItems:"center",marginBottom:20,paddingRight:32}}>
        <div style={{background:C.brandLt,borderRadius:12,width:48,height:48,display:"flex",alignItems:"center",justifyContent:"center",color:C.brand,flexShrink:0}}><Icons.building/></div>
        <div><h2 style={{margin:0,fontSize:18,fontWeight:700,color:C.slate900,fontFamily:F.display}}>{user.orgName||user.name}</h2><p style={{margin:0,fontSize:13,color:C.slate400}}>Organisation Dashboard</p></div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:24}}>
        {[["Listings",mine.length,C.brand],["Verified",mine.filter(a=>a.verified).length,C.green],["On Map",mine.filter(a=>a.lat&&a.lng).length,C.amber]].map(([l,v,c])=>(
          <div key={l} style={{background:C.slate50,borderRadius:10,padding:16,textAlign:"center",border:`1px solid ${C.slate100}`}}>
            <div style={{fontSize:26,fontWeight:700,color:c,fontFamily:F.display}}>{v}</div>
            <div style={{fontSize:12,color:C.slate400,fontWeight:500,marginTop:2}}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <h3 style={{margin:0,fontSize:15,fontWeight:600,color:C.slate800}}>Your Listings</h3>
        <Btn size="sm" onClick={()=>{onClose();onAdd();}}><Icons.plus/>Add New</Btn>
      </div>
      {mine.length===0?<div style={{textAlign:"center",padding:"32px",background:C.slate50,borderRadius:10,border:`1px solid ${C.slate100}`}}><div style={{fontSize:36,marginBottom:8}}>📋</div><p style={{color:C.slate400,fontWeight:500,fontSize:13}}>No listings yet. Add your first activity!</p></div>
      :mine.map(a=>(
        <div key={a.id} style={{background:C.slate50,borderRadius:10,padding:14,marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,border:`1px solid ${C.slate100}`}}>
          <div>
            <div style={{fontWeight:600,color:C.slate800,fontSize:14}}>{a.name}</div>
            <div style={{fontSize:12,color:C.slate400,marginTop:2}}>{a.type} · {a.location} · Ages {a.ageMin}–{a.ageMax}{a.lat?<span style={{color:C.green}}> · on map</span>:<span style={{color:C.amber}}> · no coords</span>}</div>
          </div>
          <div style={{display:"flex",gap:6,flexShrink:0}}>
            {a.verified&&<Badge variant="green">Verified</Badge>}
            <Btn variant="ghost" size="sm" onClick={()=>{onClose();onEdit(a);}}><Icons.edit/></Btn>
            <Btn variant="danger" size="sm" onClick={()=>onDelete(a.id)}><Icons.trash/></Btn>
          </div>
        </div>
      ))}
    </Modal>
  );
};

// ─── Saved Modal ──────────────────────────────────────────────────────────────
const SavedModal=({user,activities,userLoc,onOpen,onFav,onClose})=>{
  const saved=activities.filter(a=>(user.favourites||[]).includes(a.id));
  const catOf=a=>a.category==="therapy"?"therapy":a.category==="charity"?"charity":"activity";
  const [collapsed,setCollapsed]=useState({});
  const groups=[
    {key:"activity",label:"Activities",icon:"🎯",accent:"#0F6B5C",tint:"#E4F0ED"},
    {key:"therapy", label:"Therapies", icon:"🩺",accent:"#2F6E8F",tint:"#E7EFF4"},
    {key:"charity", label:"Charities", icon:"🤝",accent:"#B0701B",tint:"#F6EBD7"},
  ].map(g=>({...g,items:saved.filter(a=>catOf(a)===g.key)})).filter(g=>g.items.length);

  const Row=a=>{
    const dist=userLoc&&a.lat?haversine(userLoc.lat,userLoc.lng,a.lat,a.lng):null;
    const tc=getType(a.type);
    return(
      <div key={a.id} style={{background:C.slate50,borderRadius:10,padding:14,display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,cursor:"pointer",marginBottom:8,border:`1px solid ${C.slate100}`,transition:"background 0.15s"}} onClick={()=>{onOpen(a);onClose();}}>
        <div style={{flex:1}}>
          <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:4}}>
            <span style={{background:tc.bg,color:tc.col,padding:"2px 8px",borderRadius:5,fontSize:11,fontWeight:600}}>{tc.icon} {a.type}</span>
            {dist!=null&&<DistBadge dist={dist}/>}
          </div>
          <div style={{fontWeight:600,color:C.slate800,fontSize:14}}>{a.name}</div>
          <div style={{fontSize:12,color:C.slate400,marginTop:2}}>{a.organisation} · {a.location}</div>
        </div>
        <button onClick={e=>{e.stopPropagation();onFav(a.id);}} style={{background:"none",border:"none",cursor:"pointer",padding:6,lineHeight:0,flexShrink:0}}><Icons.heart filled={true}/></button>
      </div>
    );
  };

  return(
    <Modal onClose={onClose} maxWidth={640}>
      <h2 style={{margin:"0 0 4px",fontSize:20,fontWeight:700,color:C.slate900,fontFamily:F.display,paddingRight:32}}>Saved</h2>
      <p style={{margin:"0 0 20px",fontSize:13,color:C.slate400}}>{saved.length} saved{groups.length>1?` · ${groups.length} categories`:""}</p>
      {saved.length===0?<div style={{textAlign:"center",padding:"40px",background:C.slate50,borderRadius:10}}><div style={{fontSize:36,marginBottom:8}}>🔖</div><p style={{color:C.slate400,fontWeight:500,fontSize:13}}>Nothing saved yet. Tap the heart on any activity, therapy or charity.</p></div>
      :groups.map(g=>{
        const open=!collapsed[g.key];
        return(
        <div key={g.key} style={{marginBottom:22,borderLeft:`3px solid ${g.accent}`,paddingLeft:14}}>
          <div onClick={()=>setCollapsed(c=>({...c,[g.key]:!c[g.key]}))} role="button" aria-expanded={open} style={{display:"flex",alignItems:"center",gap:8,margin:"0 0 12px",paddingBottom:8,borderBottom:`1px solid ${g.tint}`,cursor:"pointer",userSelect:"none"}}>
            <span style={{fontSize:14}}>{g.icon}</span>
            <span style={{fontSize:12,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",color:g.accent}}>{g.label}</span>
            <span style={{fontSize:11,fontWeight:700,color:g.accent,background:g.tint,borderRadius:99,padding:"1px 8px"}}>{g.items.length}</span>
            <span style={{marginLeft:"auto",fontSize:12,color:C.slate400,lineHeight:1,transition:"transform 0.18s ease",transform:open?"rotate(0deg)":"rotate(-90deg)"}}>▾</span>
          </div>
          {open&&g.items.map(Row)}
        </div>
        );
      })}
    </Modal>
  );
};

// ─── Messages Modal (in-app replies from providers) ────────────────────────
// Reads replies:{user.id} — a key that was already being written correctly
// server-side by send-reply.js, but never actually read back anywhere in
// the app until now. Families previously only found out about a reply via
// email or push notification, with nowhere in-app to see it afterward.
const MessagesModal=({messages,onMarkRead,onOpen,onClose,activities,user})=>{
  const [openMsg,setOpenMsg]=useState(null);
  const [replyText,setReplyText]=useState("");
  const [replySending,setReplySending]=useState(false);
  const [replyDone,setReplyDone]=useState(false);
  const [replyErr,setReplyErr]=useState("");
  const sorted=[...(messages||[])].sort((a,b)=>String(b.sentAt||"").localeCompare(String(a.sentAt||"")));
  const openDetail=(m)=>{if(!m.read)onMarkRead(m.id);setOpenMsg(m);setReplyText("");setReplyDone(false);setReplyErr("");};
  const act=openMsg&&openMsg.actId?(activities||[]).find(a=>a.id===openMsg.actId):null;
  const sendReply=async()=>{
    if(!replyText.trim()){setReplyErr("Please write a reply first.");return;}
    if(!act||!user)return;
    setReplySending(true);setReplyErr("");
    try{
      const{data:{session}}=await sb.auth.getSession();
      const res=await fetch(`${API_BASE}/.netlify/functions/send-enquiry-email`,{
        method:"POST",
        headers:{"Content-Type":"application/json",...(session?.access_token?{Authorization:`Bearer ${session.access_token}`}:{})},
        body:JSON.stringify({toEmail:act.contactEmail,toName:act.organisation,actName:act.name,actId:act.id,ownerId:act.ownerId,fromName:user.name||user.email,fromEmail:user.email,fromPhone:null,message:replyText.trim()})
      });
      if(res.ok){setReplyDone(true);}
      else{const b=await res.json().catch(()=>({}));setReplyErr(b.error||"Couldn't send — please try again.");}
    }catch{setReplyErr("Couldn't send — please try again.");}
    setReplySending(false);
  };
  return(<>
    <Modal onClose={onClose} maxWidth={640}>
      <h2 style={{margin:"0 0 4px",fontSize:20,fontWeight:700,color:C.slate900,fontFamily:F.display,paddingRight:32}}>Messages</h2>
      <p style={{margin:"0 0 20px",fontSize:13,color:C.slate400}}>{sorted.length} message{sorted.length!==1?"s":""} from providers you've contacted.</p>
      {sorted.length===0?
        <div style={{textAlign:"center",padding:"40px",background:C.slate50,borderRadius:10}}>
          <div style={{fontSize:36,marginBottom:8}}>💬</div>
          <p style={{color:C.slate400,fontWeight:500,fontSize:13}}>No messages yet. When a provider replies to your enquiry in-app, it'll show up here.</p>
        </div>
      :sorted.map(m=>(
        <div key={m.id} onClick={()=>openDetail(m)} style={{background:m.read?C.slate50:C.brandLt,border:`1px solid ${m.read?C.slate100:"rgba(15,107,92,0.2)"}`,borderRadius:10,padding:"14px 16px",marginBottom:10,cursor:"pointer"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8,marginBottom:6}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontWeight:700,color:C.slate900,fontSize:14}}>{m.actName||(m.isAdmin?"IncludeMe Team":"A provider")}</span>
              {!m.read&&<span style={{fontSize:10,fontWeight:800,color:C.brand,background:"#fff",padding:"1px 7px",borderRadius:99}}>NEW</span>}
            </div>
            <span style={{fontSize:11,color:C.slate400,flexShrink:0}}>{m.sentAt?new Date(m.sentAt).toLocaleDateString("en-GB",{day:"numeric",month:"short"}):""}</span>
          </div>
          <p style={{margin:0,fontSize:13.5,color:C.slate700,lineHeight:1.55,whiteSpace:"pre-wrap",overflow:"hidden",textOverflow:"ellipsis",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{m.text}</p>
        </div>
      ))}
    </Modal>
    {openMsg&&(
      <Modal onClose={()=>setOpenMsg(null)} maxWidth={460}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14,paddingRight:28}}>
          <div style={{width:38,height:38,borderRadius:10,background:C.brandLt,display:"flex",alignItems:"center",justifyContent:"center",color:C.brand,fontWeight:700,fontSize:15,flexShrink:0}}>{(openMsg.actName||(openMsg.isAdmin?"IncludeMe Team":"?"))[0].toUpperCase()}</div>
          <div>
            <div style={{fontWeight:700,fontSize:15,color:C.slate900}}>{openMsg.actName||(openMsg.isAdmin?"IncludeMe Team":"A provider")}</div>
            <div style={{fontSize:11.5,color:C.slate400}}>{openMsg.sentAt?new Date(openMsg.sentAt).toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric",hour:"2-digit",minute:"2-digit"}):""}</div>
          </div>
        </div>
        <div style={{background:C.slate50,border:`1px solid ${C.slate100}`,borderRadius:10,padding:"14px 16px",marginBottom:18}}>
          <p style={{margin:0,fontSize:14,color:C.slate800,lineHeight:1.65,whiteSpace:"pre-wrap"}}>{openMsg.text}</p>
        </div>
        {replyDone?(
          <div style={{textAlign:"center",padding:"6px 0"}}>
            <div style={{fontSize:32,marginBottom:8}}>✅</div>
            <p style={{margin:"0 0 14px",fontSize:13.5,color:C.slate700,fontWeight:600}}>Reply sent to {openMsg.actName||"the provider"}</p>
            <button onClick={()=>setOpenMsg(null)} style={{width:"100%",padding:"11px",borderRadius:10,border:`1px solid ${C.slate200}`,background:"#fff",color:C.slate600,fontWeight:600,fontSize:13.5,cursor:"pointer",fontFamily:F.body}}>Close</button>
          </div>
        ):act?(<>
          <textarea value={replyText} onChange={e=>setReplyText(e.target.value)} placeholder={`Reply to ${openMsg.actName||"the provider"}…`} rows={3} style={{width:"100%",padding:"10px 12px",border:`1.5px solid ${C.slate200}`,borderRadius:8,fontSize:13.5,resize:"vertical",outline:"none",boxSizing:"border-box",fontFamily:F.body,color:C.slate800,lineHeight:1.5,marginBottom:8}}/>
          {replyErr&&<p style={{fontSize:12,color:C.red,margin:"0 0 8px"}}>{replyErr}</p>}
          <button onClick={sendReply} disabled={replySending} style={{width:"100%",padding:"12px",borderRadius:10,border:"none",background:C.brand,color:"#fff",fontWeight:700,fontSize:14,cursor:replySending?"default":"pointer",fontFamily:F.body,opacity:replySending?0.6:1,marginBottom:8}}>{replySending?"Sending…":"Send reply"}</button>
          <button onClick={()=>{onOpen(openMsg.actId);setOpenMsg(null);onClose();}} style={{width:"100%",padding:"9px",borderRadius:10,border:"none",background:"none",color:C.slate400,fontWeight:600,fontSize:12.5,cursor:"pointer",fontFamily:F.body}}>View full listing instead →</button>
        </>):openMsg.actId?(
          <p style={{fontSize:12.5,color:C.slate400,textAlign:"center",lineHeight:1.5,margin:0}}>This listing couldn't be loaded right now — try again in a moment, or reopen the app.</p>
        ):openMsg.isAdmin?(
          <p style={{fontSize:12.5,color:C.slate400,textAlign:"center",lineHeight:1.5,margin:0}}>This is an announcement from the IncludeMe team, not tied to a specific listing. Reply to this message by emailing hello@includeme.uk.</p>
        ):(
          <p style={{fontSize:12.5,color:C.slate400,textAlign:"center",lineHeight:1.5,margin:0}}>This is an older message that isn't linked to a listing. Search for {openMsg.actName||"the provider"} in the app to get in touch again.</p>
        )}
      </Modal>
    )}
  </>);
};
// ─── My Listings Panel (used inside AccountModal) ─────────────────────────────
// ─── Analytics modal — views & saves breakdown for featured listings ───────────
const AnalyticsModal=({act,onClose})=>{
  const [s,setS]=useState(null);
  useEffect(()=>{
    Promise.all([store.get(`views:${act.id}`),store.get(`saves:${act.id}`),store.get(`views_history:${act.id}`),store.get(`saves_history:${act.id}`)]).then(([v,sv,vh,sh])=>{
      const totalViews=v?.count??0;const totalSaves=sv?.count??0;
      // Build a real 7-day array from the date-keyed history object
      const last7=Array.from({length:7},(_,i)=>{
        const d=new Date();d.setDate(d.getDate()-(6-i));return d.toISOString().slice(0,10);
      });
      const viewDays=last7.map(k=>(vh?.days||{})[k]||0);
      const saveDays=last7.map(k=>(sh?.days||{})[k]||0);
      // If no history yet, distribute total across last 7 days proportionally so chart isn't empty
      const fillSynth=(days,total)=>{
        if(days.some(v=>v>0))return days;
        const out=new Array(7).fill(0);let rem=total;
        for(let i=6;i>=0;i--){const v=i===0?rem:Math.round(rem*(0.1+Math.random()*0.25));out[i]=Math.max(0,v);rem=Math.max(0,rem-out[i]);}
        return out;
      };
      const labels=last7.map(iso=>new Date(iso+"T00:00:00").toLocaleDateString("en-GB",{weekday:"short"}));
      setS({totalViews,totalSaves,viewDays:fillSynth(viewDays,totalViews),saveDays:fillSynth(saveDays,totalSaves),labels,hasRealHistory:viewDays.some(v=>v>0)||saveDays.some(v=>v>0)});
    }).catch(()=>setS({totalViews:0,totalSaves:0,viewDays:[0,0,0,0,0,0,0],saveDays:[0,0,0,0,0,0,0],labels:["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],hasRealHistory:false}));
  },[act.id]);
  const Bar=({value,max,color})=>(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,flex:1}}>
      <div style={{width:"100%",height:80,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
        <div style={{width:"60%",background:color,borderRadius:"4px 4px 0 0",height:max>0?`${Math.max(4,Math.round((value/max)*80))}px`:"4px",transition:"height 0.3s ease"}}/>
      </div>
      <span style={{fontSize:10,color:C.slate400,fontWeight:600}}>{value}</span>
    </div>
  );
  return(
    <Modal onClose={onClose} maxWidth={480}>
      <h2 style={{margin:"0 0 4px",fontSize:19,fontWeight:700,color:C.slate900,fontFamily:F.display,paddingRight:32}}>{act.name}</h2>
      <p style={{margin:"0 0 20px",fontSize:13,color:C.slate400}}>Analytics — last 7 days</p>
      {!s?<p style={{color:C.slate400,fontSize:13}}>Loading…</p>:(
        <>
          {/* Totals */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:22}}>
            <div style={{background:C.brandLt,borderRadius:12,padding:"14px 18px"}}>
              <div style={{fontSize:28,fontWeight:700,color:C.brand,fontFamily:F.display}}>{s.totalViews}</div>
              <div style={{fontSize:12,color:C.brand,fontWeight:600,marginTop:2}}>Total views</div>
              <div style={{fontSize:11,color:C.slate400,marginTop:2}}>families viewed your listing</div>
            </div>
            <div style={{background:"#FFF7E6",borderRadius:12,padding:"14px 18px"}}>
              <div style={{fontSize:28,fontWeight:700,color:"#D97706",fontFamily:F.display}}>{s.totalSaves}</div>
              <div style={{fontSize:12,color:"#D97706",fontWeight:600,marginTop:2}}>Total saves</div>
              <div style={{fontSize:11,color:C.slate400,marginTop:2}}>families saved your listing</div>
            </div>
          </div>
          {/* Views chart */}
          <p style={{margin:"0 0 8px",fontSize:11,fontWeight:700,color:C.slate500,textTransform:"uppercase",letterSpacing:"0.07em"}}>Views — last 7 days</p>
          <div style={{display:"flex",gap:4,alignItems:"flex-end",background:C.slate50,borderRadius:10,padding:"12px 10px 8px",marginBottom:20}}>
            {s.labels.map((label,i)=>(
              <div key={label} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                <Bar value={s.viewDays[i]} max={Math.max(...s.viewDays,1)} color={C.brand}/>
                <span style={{fontSize:9,color:C.slate400,fontWeight:600}}>{label}</span>
              </div>
            ))}
          </div>
          {/* Saves chart */}
          <p style={{margin:"0 0 8px",fontSize:11,fontWeight:700,color:C.slate500,textTransform:"uppercase",letterSpacing:"0.07em"}}>Saves — last 7 days</p>
          <div style={{display:"flex",gap:4,alignItems:"flex-end",background:"#FFF7E6",borderRadius:10,padding:"12px 10px 8px",marginBottom:20}}>
            {s.labels.map((label,i)=>(
              <div key={label} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                <Bar value={s.saveDays[i]} max={Math.max(...s.saveDays,1)} color="#D97706"/>
                <span style={{fontSize:9,color:C.slate400,fontWeight:600}}>{label}</span>
              </div>
            ))}
          </div>
          <p style={{fontSize:11.5,color:C.slate400,margin:0,lineHeight:1.5}}>{s.hasRealHistory?"Daily data is recorded each time a family views or saves your listing.":"Daily breakdown is estimated from your total — precise daily data records from today onwards."}</p>
        </>
      )}
    </Modal>
  );
};

const ListingStatRow=({actId,featured,onOpenAnalytics})=>{
  const [s,setS]=useState({views:"…",saves:"…"});
  useEffect(()=>{
    if(!featured)return; // only load for featured listings
    Promise.all([store.get(`views:${actId}`),store.get(`saves:${actId}`)]).then(([v,sv])=>{
      setS({views:v?.count??0,saves:sv?.count??0});
    }).catch(()=>setS({views:0,saves:0}));
  },[actId,featured]);
  if(!featured)return null; // only show for featured
  return(
    <button onClick={onOpenAnalytics} style={{display:"flex",gap:14,marginTop:8,background:C.brandLt,border:`1px solid rgba(15,107,92,0.15)`,borderRadius:8,padding:"6px 12px",cursor:"pointer",fontFamily:F.body,alignItems:"center"}}>
      <span style={{fontSize:12,color:C.brand}}><strong style={{color:C.brand,fontWeight:700}}>{s.views}</strong> <span style={{fontWeight:500}}>views</span></span>
      <span style={{fontSize:12,color:C.brand}}><strong style={{color:C.brand,fontWeight:700}}>{s.saves}</strong> <span style={{fontWeight:500}}>saves</span></span>
      <span style={{fontSize:11,color:C.brand,marginLeft:"auto",fontWeight:600}}>See breakdown →</span>
    </button>
  );
};

// In-app reply box on each enquiry (lightweight reply path). Saves the reply
// and notifies the family by email + push via the send-reply function. Falls
// back gracefully (just closes) if the function isn't reachable in preview.
const ReplyBox=({enquiry,onSent})=>{
  const [open,setOpen]=useState(false);
  const [text,setText]=useState("");
  const [sending,setSending]=useState(false);
  const [done,setDone]=useState(false);
  const [err,setErr]=useState("");
  if(done)return <div style={{marginTop:8,fontSize:12,color:C.brand,fontWeight:600}}>✓ Reply sent to {enquiry.fromName}</div>;
  if(!open)return <button onClick={()=>setOpen(true)} style={{marginTop:8,padding:"6px 12px",borderRadius:8,border:"none",background:C.brand,color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:F.body}}>Reply in app</button>;
  const send=async()=>{
    if(!text.trim()){setErr("Write a reply first.");return;}
    setSending(true);setErr("");
    try{
      const{data:{session}}=await sb.auth.getSession();
      const res=await fetch(`${API_BASE}/.netlify/functions/send-reply`,{
        method:"POST",
        headers:{"Content-Type":"application/json",...(session?.access_token?{Authorization:`Bearer ${session.access_token}`}:{})},
        body:JSON.stringify({enquiryId:enquiry.id,toUserId:enquiry.fromUserId,toEmail:enquiry.fromEmail,actId:enquiry.actId,actName:enquiry.actName,replyText:text.trim()})
      });
      if(res.ok){setDone(true);onSent&&onSent();}
      else{const b=await res.json().catch(()=>({}));setErr(b.error||"Couldn't send — try email instead.");}
    }catch{setErr("Couldn't send — try email instead.");}
    setSending(false);
  };
  return(
    <div style={{marginTop:8}}>
      <textarea value={text} onChange={e=>setText(e.target.value)} placeholder={`Reply to ${enquiry.fromName}…`} rows={3} style={{...inputStyle,marginBottom:6,minHeight:60,resize:"vertical",lineHeight:1.5}}/>
      {err&&<div style={{fontSize:11.5,color:C.red,marginBottom:6}}>{err}</div>}
      <div style={{display:"flex",gap:8}}>
        <button onClick={send} disabled={sending} style={{padding:"6px 14px",borderRadius:8,border:"none",background:C.brand,color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:F.body,opacity:sending?0.6:1}}>{sending?"Sending…":"Send reply"}</button>
        <button onClick={()=>setOpen(false)} style={{padding:"6px 14px",borderRadius:8,border:`1px solid ${C.slate200}`,background:"#fff",color:C.slate500,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:F.body}}>Cancel</button>
      </div>
    </div>
  );
};

const ListingsPanel=({listings,user,onEdit,onDelete,onActivate,onActivateVerified,upgradeConfirmation,initialShowEnquiries})=>{
  const [billingLoadingId,setBillingLoadingId]=useState(null);
  const manageBilling=async actId=>{
    setBillingLoadingId(actId);
    try{
      const{data:{session}}=await sb.auth.getSession();
      const res=await fetch(`${API_BASE}/.netlify/functions/create-portal-session`,{
        method:"POST",
        headers:{"Content-Type":"application/json",...(session?.access_token?{Authorization:`Bearer ${session.access_token}`}:{})},
        body:JSON.stringify({actId}),
      });
      const data=await res.json();
      if(data.url)window.location.href=data.url;
      else alert(data.error||"Couldn't open billing management. Please try again or contact hello@includeme.uk.");
    }catch{
      alert("Couldn't open billing management. Please try again or contact hello@includeme.uk.");
    }
    setBillingLoadingId(null);
  };
  const [upgradeAct,setUpgradeAct]=useState(null);
  const [verifyAct,setVerifyAct]=useState(null);
  const [analyticsAct,setAnalyticsAct]=useState(null);
  const [enquiries,setEnquiries]=useState(null);
  const [activeInbox,setActiveInbox]=useState(!!initialShowEnquiries);
  const [badgeOpenId,setBadgeOpenId]=useState(null);
  useEffect(()=>{
    if(!user)return;
    store.get(`enquiries:${user.id}`).then(v=>setEnquiries(v||[])).catch(()=>setEnquiries([]));
  },[user&&user.id]);
  const markRead=(id)=>{
    const updated=(enquiries||[]).map(e=>e.id===id?{...e,read:true}:e);
    setEnquiries(updated);store.set(`enquiries:${user.id}`,updated).catch(()=>{});
  };
  const unread=(enquiries||[]).filter(e=>!e.read).length;
  if(!listings.length)return(
    <div style={{textAlign:"center",padding:"32px 0",color:C.slate400}}>
      <div style={{fontSize:36,marginBottom:12}}>📋</div>
      <p style={{fontSize:14,fontWeight:500}}>No listings yet.</p>
      <p style={{fontSize:13}}>Add an activity using the <strong>+ Add listing</strong> button in the header, or claim an existing listing.</p>
    </div>
  );
  return(
    <>
      {upgradeAct&&<FeaturedUpgradeModal act={upgradeAct} user={user} onActivated={onActivate} onEdit={onEdit} onClose={()=>setUpgradeAct(null)}/>}
      {verifyAct&&<GetVerifiedModal act={verifyAct} user={user} onActivated={onActivateVerified} onClose={()=>setVerifyAct(null)}/>}
      {analyticsAct&&<AnalyticsModal act={analyticsAct} onClose={()=>setAnalyticsAct(null)}/>}
      {upgradeConfirmation&&(
        <div style={{marginBottom:14,borderRadius:10,padding:"12px 14px",background:"#ECFDF5",border:"1px solid #6EE7B7",display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:18}}>✅</span>
          <span style={{fontSize:13,color:"#065F46",fontWeight:500}}>
            Payment received — your listing is now <strong>{upgradeConfirmation==="featured"?"Featured":"Verified"}</strong>. It can take a few seconds to appear below; refresh if you don't see it yet.
          </span>
        </div>
      )}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
        <h3 style={{margin:0,fontSize:15,fontWeight:600,color:C.slate800}}>My Listings</h3>
        <button onClick={()=>setActiveInbox(v=>!v)} style={{display:"flex",alignItems:"center",gap:6,padding:"6px 12px",borderRadius:8,border:`1.5px solid ${activeInbox?C.brand:C.slate200}`,background:activeInbox?C.brand:C.white,color:activeInbox?"white":C.slate600,fontSize:12.5,fontWeight:600,cursor:"pointer",fontFamily:F.body}}>
          ✉️ Enquiries{unread>0&&<span style={{background:activeInbox?"rgba(255,255,255,0.3)":"#EF4444",color:"white",borderRadius:99,padding:"1px 7px",fontSize:11,fontWeight:800}}>{unread}</span>}
        </button>
      </div>
      {(()=>{
        const target=listings.find(a=>!a.featured);
        if(!target)return null;
        return(
          <div style={{marginTop:14,marginBottom:18,borderRadius:14,padding:"18px 18px",background:"linear-gradient(135deg,#0F6B5C,#1A8470)",boxShadow:"0 6px 20px rgba(15,107,92,0.25)"}}>
            <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:14,flexWrap:"wrap"}}>
              <div style={{flex:1,minWidth:200}}>
                <div style={{fontSize:13.5,fontWeight:700,color:"white",marginBottom:4,display:"flex",alignItems:"center",gap:6}}>⭐ Get more families finding {listings.length>1?"your listings":target.name}</div>
                <div style={{fontSize:12.5,color:"rgba(255,255,255,0.85)",lineHeight:1.55}}>Featured listings appear first when local families search — plus a gold badge, more photos, and the ability to reply to reviews. Most providers see noticeably more enquiries within the first week.</div>
              </div>
              <button onClick={()=>setUpgradeAct(target)} style={{flexShrink:0,background:"white",color:C.brand,border:"none",borderRadius:9,padding:"10px 18px",fontSize:13,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap",boxShadow:"0 2px 8px rgba(0,0,0,0.15)"}}>
                Feature my listing →
              </button>
            </div>
          </div>
        );
      })()}
      {activeInbox?(
        <div style={{marginBottom:16}}>
          {(!enquiries||enquiries.length===0)?(
            <div style={{textAlign:"center",padding:"28px 0",color:C.slate400}}>
              <div style={{fontSize:28,marginBottom:8}}>✉️</div>
              <p style={{fontSize:13}}>No enquiries yet — they'll appear here when families reach out.</p>
            </div>
          ):(
            [...enquiries].sort((a,b)=>b.sentAt.localeCompare(a.sentAt)).map(e=>(
              <div key={e.id} onClick={()=>markRead(e.id)} style={{background:e.read?C.slate50:C.brandLt,border:`1px solid ${e.read?C.slate100:"rgba(15,107,92,0.2)"}`,borderRadius:10,padding:"12px 14px",marginBottom:8,cursor:"pointer"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8,marginBottom:6}}>
                  <div>
                    <span style={{fontWeight:700,color:C.slate900,fontSize:13.5}}>{e.fromName}</span>
                    {!e.read&&<span style={{marginLeft:8,fontSize:10,fontWeight:800,color:C.brand,background:C.brandLt,padding:"1px 7px",borderRadius:99}}>NEW</span>}
                  </div>
                  <span style={{fontSize:11,color:C.slate400,flexShrink:0}}>{new Date(e.sentAt).toLocaleDateString("en-GB",{day:"numeric",month:"short"})}</span>
                </div>
                <div style={{fontSize:12,color:C.slate500,marginBottom:6}}>Re: <strong>{e.actName}</strong></div>
                <div style={{fontSize:13,color:C.slate700,lineHeight:1.5}}>{e.message}</div>
                {e.fromPhone&&<div style={{fontSize:12,color:C.slate500,marginTop:6}}>📞 {e.fromPhone}</div>}
                <div onClick={ev=>ev.stopPropagation()}>
                  <ReplyBox enquiry={e} onSent={()=>markRead(e.id)}/>
                  <a href={`mailto:${e.fromEmail}`} style={{display:"inline-block",marginTop:6,fontSize:11.5,color:C.slate400,fontWeight:600,textDecoration:"none"}}>or reply by email: {e.fromEmail}</a>
                </div>
              </div>
            ))
          )}
        </div>
      ):null}
      <p style={{margin:"0 0 18px",fontSize:13,color:C.slate400}}>{listings.length} listing{listings.length!==1?"s":""} — edit details, photos and more</p>
      {(()=>{const nh=nextHoliday();if(!nh||nh.days>HOLIDAY_WINDOW_DAYS)return null;return(
        <div style={{display:"flex",alignItems:"center",gap:10,background:"#FAF8FF",border:"1px solid #E9E3FB",borderRadius:10,padding:"12px 14px",marginBottom:16}}>
          <span style={{fontSize:18}}>🗓️</span>
          <div style={{fontSize:13,color:C.slate700,lineHeight:1.45}}><strong>{nh.name} start in {nh.days} days.</strong> Running a holiday club? Add it to your listing (Edit → Holiday clubs) so families can find and book it.</div>
        </div>
      );})()}
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {listings.map(act=>(
          <div key={act.id} style={{border:`1px solid ${C.slate200}`,borderRadius:12,padding:"14px 16px",background:act.featured?`${C.amber}08`:C.white}}>
            <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:10}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:600,fontSize:14,color:C.slate900,marginBottom:2,display:"flex",alignItems:"center",gap:7}}>
                  {act.name}
                  {act.featured&&<FeaturedBadge/>}
                  {act.verified&&<span style={{fontSize:11,color:C.green,fontWeight:700,display:"inline-flex",alignItems:"center",gap:3}}><Icons.check/>Verified</span>}
                </div>
                <div style={{fontSize:12,color:C.slate400}}>{act.organisation} · {act.location}</div>
                <ListingStatRow actId={act.id} featured={act.featured} onOpenAnalytics={()=>setAnalyticsAct(act)}/>
              </div>
              {(!act.featured||!act.verifiedPaid)&&(
                <div style={{flexShrink:0,display:"flex",flexDirection:"column",gap:6,alignItems:"flex-end"}}>
                  {!act.featured&&(
                    <button onClick={()=>setUpgradeAct(act)}
                      style={{background:"linear-gradient(135deg,#F59E0B,#D97706)",color:"#fff",border:"none",borderRadius:8,padding:"6px 12px",fontSize:11.5,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap",boxShadow:"0 2px 8px rgba(217,119,6,0.25)"}}>
                      ⭐ Get Featured · £49/mo
                    </button>
                  )}
                  {!act.verifiedPaid&&(
                    <button onClick={()=>setVerifyAct(act)}
                      style={{background:C.brandLt,color:C.brand,border:`1.5px solid ${C.brand}`,borderRadius:8,padding:"6px 12px",fontSize:11.5,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"}}>
                      ✓ Get Verified · £15/mo
                    </button>
                  )}
                </div>
              )}
            </div>
            <div style={{display:"flex",gap:8,marginTop:12,paddingTop:12,borderTop:`1px solid ${C.slate100}`}}>
              <button onClick={()=>onEdit&&onEdit(act)} style={{display:"flex",alignItems:"center",gap:5,padding:"7px 14px",borderRadius:8,border:`1.5px solid ${C.brand}`,background:C.brandLt,color:C.brand,fontSize:12.5,fontWeight:700,cursor:"pointer",fontFamily:F.body}}><Icons.edit/>Edit listing</button>
              {(act.featured||act.verifiedPaid)&&(
                <button onClick={()=>manageBilling(act.id)} disabled={billingLoadingId===act.id} style={{display:"flex",alignItems:"center",gap:5,padding:"7px 12px",borderRadius:8,border:`1.5px solid ${C.slate200}`,background:C.white,color:C.slate500,fontSize:12.5,fontWeight:600,cursor:billingLoadingId===act.id?"default":"pointer",fontFamily:F.body,opacity:billingLoadingId===act.id?0.6:1}}>
                  💳 {billingLoadingId===act.id?"Loading…":"Manage billing"}
                </button>
              )}
              <button onClick={()=>setBadgeOpenId(badgeOpenId===act.id?null:act.id)} style={{display:"flex",alignItems:"center",gap:5,padding:"7px 12px",borderRadius:8,border:`1.5px solid ${badgeOpenId===act.id?C.brand:C.slate200}`,background:badgeOpenId===act.id?C.brandLt:C.white,color:badgeOpenId===act.id?C.brand:C.slate500,fontSize:12.5,fontWeight:600,cursor:"pointer",fontFamily:F.body}}>💚 Badge</button>
              <button onClick={()=>{if(window.confirm(`Delete "${act.name}"? This cannot be undone.`))onDelete&&onDelete(act.id);}} style={{display:"flex",alignItems:"center",gap:5,padding:"7px 12px",borderRadius:8,border:`1.5px solid ${C.slate200}`,background:C.white,color:C.slate500,fontSize:12.5,fontWeight:600,cursor:"pointer",fontFamily:F.body}}><Icons.trash/></button>
            </div>
            {badgeOpenId===act.id&&<div style={{marginTop:12}}><ProviderBadgeCard act={act}/></div>}
          </div>
        ))}
      </div>
      <div style={{marginTop:20,padding:"14px 16px",background:C.brandLt,borderRadius:12}}>
        <div style={{fontWeight:600,fontSize:13.5,color:C.brand,marginBottom:8}}>Grow your reach</div>
        <div style={{fontSize:12.5,color:C.brand,lineHeight:1.6,opacity:0.9}}>
          <strong>Verified (£15/mo)</strong> adds a trust badge confirming your details are real and current.<br/>
          <strong>Featured (£49/mo)</strong> includes everything in Verified, plus priority placement near local families, a gold badge, and room for more photos.<br/>
          Both activate instantly — cancel any time.
        </div>
      </div>
    </>
  );
};

// ─── Admin Panel ─────────────────────────────────────────────────────────────
// ─── Admin verification checklist modal ──────────────────────────────────────
const VERIFY_CHECKS=[
  {k:"postcode",label:"Postcode confirmed against website or Maps"},
  {k:"website",label:"Website is live and refers to this service"},
  {k:"phone",label:"Phone number tested / confirmed correct"},
  {k:"ages",label:"Age range confirmed"},
  {k:"description",label:"Description is accurate and our own words"},
  {k:"contact",label:"Contact details complete"},
];
const AdminVerifyModal=({act,onVerify,onClose})=>{
  const [checks,setChecks]=useState({});
  const allDone=VERIFY_CHECKS.every(c=>checks[c.k]);
  return(
    <Modal onClose={onClose} maxWidth={440}>
      <h2 style={{margin:"0 0 4px",fontSize:18,fontWeight:700,color:C.slate900,fontFamily:F.display,paddingRight:32}}>Verify listing</h2>
      <p style={{margin:"0 0 18px",fontSize:13,color:C.slate500}}>{act.name} · {act.organisation}</p>
      {act.website&&<a href={act.website} target="_blank" rel="noreferrer" style={{display:"inline-block",marginBottom:14,fontSize:12.5,color:C.brand,fontWeight:600}}>🔗 Open website ↗</a>}
      <div style={{marginBottom:20}}>
        {VERIFY_CHECKS.map(({k,label})=>(
          <label key={k} style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:10,cursor:"pointer"}}>
            <input type="checkbox" checked={!!checks[k]} onChange={e=>setChecks(p=>({...p,[k]:e.target.checked}))} style={{accentColor:C.brand,marginTop:2,width:15,height:15,flexShrink:0}}/>
            <span style={{fontSize:13,color:checks[k]?C.brand:C.slate700,fontWeight:checks[k]?600:400,lineHeight:1.4}}>{label}</span>
          </label>
        ))}
      </div>
      <div style={{display:"flex",gap:8}}>
        <Btn full disabled={!allDone} onClick={()=>onVerify(checks)}>
          {allDone?"✓ Mark as verified":"Complete all checks to verify"}
        </Btn>
        <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
      </div>
    </Modal>
  );
};

// ─── Admin outreach tab — unclaimed providers with email drafts ────────────────
const AdminOutreachTab=({activities})=>{
  const [draftAct,setDraftAct]=useState(null);
  const [draftType,setDraftType]=useState("claim");
  const [picked,setPicked]=useState(()=>new Set());
  const [sending,setSending]=useState(false);
  const [sendResult,setSendResult]=useState("");
  const [search,setSearch]=useState("");
  const [invitedAt,setInvitedAt]=useState(()=>new Map());
  const [hideInvited,setHideInvited]=useState(true);
  const [reinviteDays,setReinviteDays]=useState(7);
  const [registeredEmails,setRegisteredEmails]=useState(()=>new Set());
  const [hideRegistered,setHideRegistered]=useState(true);
  const [loadingInvited,setLoadingInvited]=useState(true);
  useEffect(()=>{
    // Fetch who's already been invited — and WHEN — so repeated "Select
    // first 40" clicks move on to a fresh batch instead of re-selecting
    // the same people every time. This used to hide anyone ever invited,
    // permanently — but with hundreds already invited across past
    // sessions, that meant the pool of "eligible" listings kept shrinking
    // toward zero with no way to legitimately follow up later. Now it's a
    // rolling window (reinviteDays, default 7): someone invited more than
    // that many days ago becomes eligible again, since a week-plus with no
    // response is a reasonable point to try once more, not spam.
    (async()=>{
      try{
        const keys=await store.list("claim_invited:");
        const rows=await Promise.all((keys||[]).map(async k=>{const v=await store.get(k);return[k.replace("claim_invited:",""),v?.invitedAt||null];}));
        setInvitedAt(new Map(rows.filter(([,at])=>at)));
      }catch{ /* non-fatal — just falls back to no exclusions */ }
      try{
        const userKeys=await store.list("user:");
        setRegisteredEmails(new Set((userKeys||[]).map(k=>k.replace("user:","").toLowerCase())));
      }catch{ /* non-fatal — just falls back to no exclusions */ }
      setLoadingInvited(false);
    })();
  },[]);
  const allUnclaimed=activities.filter(a=>(!a.ownerId||a.ownerId==="seed")&&a.contactEmail&&!a.contactEmail.includes("via website"));
  const isRegistered=(a)=>a.contactEmail&&registeredEmails.has(a.contactEmail.toLowerCase());
  const daysSinceInvited=(id)=>{const at=invitedAt.get(id);if(!at)return null;return(Date.now()-new Date(at).getTime())/86400000;};
  const isRecentlyInvited=(id)=>{const d=daysSinceInvited(id);return d!=null&&d<reinviteDays;};
  const searchLower=search.trim().toLowerCase();
  const unclaimed=allUnclaimed
    .filter(a=>!hideInvited||!isRecentlyInvited(a.id))
    .filter(a=>!hideRegistered||!isRegistered(a))
    .filter(a=>!searchLower||[a.name,a.organisation,a.location].some(f=>(f||"").toLowerCase().includes(searchLower)));
  const toggle=(id)=>setPicked(p=>{const n=new Set(p);n.has(id)?n.delete(id):n.add(id);return n;});
  const pickedList=allUnclaimed.filter(a=>picked.has(a.id));
  const sendInvites=async()=>{
    if(!pickedList.length){setSendResult("Select at least one listing first.");return;}
    if(pickedList.length>40){setSendResult("Max 40 per batch — deselect some to protect deliverability.");return;}
    setSending(true);setSendResult("");
    try{
      const{data:{session}}=await sb.auth.getSession();
      if(!session?.access_token){setSendResult("Sign in again to send.");setSending(false);return;}
      const res=await fetch(`${API_BASE}/.netlify/functions/send-claim-invites`,{
        method:"POST",
        headers:{"Content-Type":"application/json",Authorization:`Bearer ${session.access_token}`},
        body:JSON.stringify({recipients:pickedList.map(a=>({id:a.id,email:a.contactEmail,orgName:a.organisation,listingName:a.name,location:a.location}))})
      });
      if(res.ok){const b=await res.json();setSendResult(`✓ Sent ${b.sent} invite${b.sent!==1?"s":""}${b.failed?`, ${b.failed} failed`:""}. Tip: send in small batches and watch responses before sending more.`);const now=new Date().toISOString();setInvitedAt(prev=>{const n=new Map(prev);pickedList.forEach(a=>n.set(a.id,now));return n;});setPicked(new Set());}
      else{const b=await res.json().catch(()=>({}));setSendResult("Couldn't send: "+(b.error||res.status));}
    }catch(e){setSendResult("Couldn't send — is the site deployed? "+(e?.message||""));}
    setSending(false);
  };
  // Geographic coverage summary
  const byCoverage=(()=>{
    const counts={};
    activities.forEach(a=>{
      const area=a.postcode?a.postcode.slice(0,2).toUpperCase():a.location?a.location.split(",").pop().trim().slice(0,8):"Other";
      counts[area]=(counts[area]||0)+1;
    });
    return Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,20);
  })();
  const claimTemplate=(a)=>`Subject: Claim your free listing on IncludeMe — ${a.name}

Hi ${a.organisation},

I noticed that ${a.name} is already listed on IncludeMe (includeme.uk) — the UK directory helping families of disabled children find activities, therapies and clubs near them.

Your listing is live and families are already finding you. By claiming it, you can:
• Update your description, photos and contact details
• Add holiday club dates so families can find and book
• Show your availability status in real time

Claiming is completely free and takes under 5 minutes. Just visit:
includeme.uk and tap "Claim this listing" on your page.

If you have any questions I'm happy to help.

Best wishes,
IncludeMe`;
  const featuredTemplate=(a)=>`Subject: Get priority placement on IncludeMe — ${a.name}

Hi ${a.organisation},

${a.name} is listed on IncludeMe and families in your area are already finding you — great news!

I wanted to let you know about our Featured tier, which gives you:
• Priority placement at the top of local searches
• Your listing shown first to families within 25 miles
• Analytics showing how many families have viewed and saved your listing
• A trust badge that increases enquiries

Featured is just £49/month and many providers see a noticeable uptick in bookings within the first few weeks.

Interested? Reply to this email or visit includeme.uk to upgrade directly.

Best wishes,
IncludeMe`;

  return(
    <div>
      {/* Coverage summary */}
      <div style={{marginBottom:20}}>
        <h3 style={{margin:"0 0 4px",fontSize:15,fontWeight:600,color:C.slate800}}>Geographic coverage</h3>
        <p style={{margin:"0 0 12px",fontSize:13,color:C.slate400}}>Listings by area — spots with &lt; 5 listings may need expansion.</p>
        <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
          {byCoverage.map(([area,count])=>(
            <div key={area} style={{padding:"5px 12px",borderRadius:20,background:count>=10?C.brandLt:count>=5?"#FFF7E6":"#FEF2F2",border:`1px solid ${count>=10?"rgba(15,107,92,0.2)":count>=5?"#FCD34D":"#FECACA"}`,fontSize:12}}>
              <strong style={{color:count>=10?C.brand:count>=5?"#D97706":"#DC2626"}}>{area}</strong>
              <span style={{color:C.slate500,marginLeft:5}}>{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Unclaimed with email */}
      <div style={{borderTop:`1px solid ${C.slate100}`,paddingTop:16}}>
        <h3 style={{margin:"0 0 4px",fontSize:15,fontWeight:600,color:C.slate800}}>Provider outreach</h3>
        <p style={{margin:"0 0 12px",fontSize:13,color:C.slate400}}>{allUnclaimed.length} unclaimed listings with contact emails{invitedAt.size>0?` · ${allUnclaimed.filter(a=>isRecentlyInvited(a.id)).length} invited in the last ${reinviteDays} days`:""}{registeredEmails.size>0?` · ${allUnclaimed.filter(isRegistered).length} already registered (mid-claim)`:""}. Tick the ones to invite, then send a batch of beautifully-designed claim emails — each with a one-click link to that provider's listing.</p>

        {/* Search + filters */}
        <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center",marginBottom:10}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name, organisation or location…" style={{flex:1,minWidth:180,padding:"8px 12px",borderRadius:8,border:`1.5px solid ${C.slate200}`,fontSize:13,fontFamily:F.body,color:C.slate800}}/>
          <label style={{display:"flex",alignItems:"center",gap:6,fontSize:12.5,color:C.slate600,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap"}}>
            <input type="checkbox" checked={hideInvited} onChange={e=>setHideInvited(e.target.checked)} style={{accentColor:C.brand,cursor:"pointer"}}/>
            Hide invited in the last
          </label>
          <select value={reinviteDays} onChange={e=>setReinviteDays(Number(e.target.value))} disabled={!hideInvited} style={{padding:"5px 8px",borderRadius:7,border:`1.5px solid ${C.slate200}`,fontSize:12.5,fontFamily:F.body,color:C.slate700,cursor:hideInvited?"pointer":"default",opacity:hideInvited?1:0.5}}>
            <option value={3}>3 days</option>
            <option value={7}>7 days</option>
            <option value={14}>14 days</option>
            <option value={30}>30 days</option>
          </select>
          <label style={{display:"flex",alignItems:"center",gap:6,fontSize:12.5,color:C.slate600,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap"}} title="Someone with this contact email already created an account — they've engaged already, so a cold invite is the wrong message for them.">
            <input type="checkbox" checked={hideRegistered} onChange={e=>setHideRegistered(e.target.checked)} style={{accentColor:C.brand,cursor:"pointer"}}/>
            Hide already-registered
          </label>
        </div>

        {/* Batch send bar */}
        <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",background:C.brandLt,border:`1px solid rgba(15,107,92,0.2)`,borderRadius:10,padding:"10px 14px",marginBottom:12}}>
          <button onClick={()=>setPicked(new Set(unclaimed.slice(0,40).map(a=>a.id)))} style={{padding:"6px 11px",borderRadius:7,border:`1px solid ${C.brand}`,background:"#fff",color:C.brand,fontSize:11.5,fontWeight:700,cursor:"pointer",fontFamily:F.body}}>Select first 40 {search||hideInvited||hideRegistered?"(filtered)":""}</button>
          <button onClick={()=>setPicked(new Set())} style={{padding:"6px 11px",borderRadius:7,border:`1px solid ${C.slate200}`,background:"#fff",color:C.slate500,fontSize:11.5,fontWeight:600,cursor:"pointer",fontFamily:F.body}}>Clear</button>
          <span style={{fontSize:12.5,color:C.slate600,fontWeight:600}}>{picked.size} selected · {unclaimed.length} shown</span>
          <div style={{flex:1}}/>
          <button onClick={sendInvites} disabled={sending||!picked.size} style={{padding:"8px 16px",borderRadius:8,border:"none",background:picked.size?C.brand:C.slate200,color:"#fff",fontSize:12.5,fontWeight:700,cursor:picked.size?"pointer":"default",fontFamily:F.body,opacity:sending?0.6:1}}>{sending?"Sending…":`Send ${picked.size||""} claim invite${picked.size!==1?"s":""}`}</button>
        </div>
        {sendResult&&<div style={{fontSize:12.5,color:sendResult.startsWith("✓")?C.brand:C.red,marginBottom:12,fontWeight:600,lineHeight:1.5}}>{sendResult}</div>}

        {loadingInvited?<p style={{fontSize:12.5,color:C.slate400}}>Checking invite history…</p>:unclaimed.length===0?
          <div style={{textAlign:"center",padding:"24px 0",color:C.slate400,fontSize:13}}>
            {search?"No listings match that search.":"Everyone's been invited or has already registered — uncheck the filters above to see them again, or wait for responses before re-sending."}
          </div>
        :<div style={{display:"flex",flexDirection:"column",gap:6,maxHeight:"50vh",overflowY:"auto"}}>
          {unclaimed.map(act=>(
            <div key={act.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 13px",borderRadius:9,border:`1px solid ${picked.has(act.id)?C.brand:C.slate200}`,background:picked.has(act.id)?C.brandLt:"#fff"}}>
              <input type="checkbox" checked={picked.has(act.id)} onChange={()=>toggle(act.id)} style={{width:17,height:17,accentColor:C.brand,cursor:"pointer",flexShrink:0}}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:600,fontSize:13,color:C.slate900,display:"flex",alignItems:"center",gap:6}}>
                  {act.name}
                  {(()=>{const d=daysSinceInvited(act.id);if(d==null)return null;const recent=d<reinviteDays;return(
                    <span style={{fontSize:9.5,fontWeight:700,color:recent?C.amber:C.slate500,background:recent?"#FEF3C7":C.slate100,borderRadius:99,padding:"1px 7px",textTransform:"uppercase",letterSpacing:"0.03em"}}>
                      Invited {Math.floor(d)===0?"today":`${Math.floor(d)}d ago`}{!recent?" — eligible again":""}
                    </span>
                  );})()}
                  {isRegistered(act)&&<span style={{fontSize:9.5,fontWeight:700,color:"#2563EB",background:"#DBEAFE",borderRadius:99,padding:"1px 7px",textTransform:"uppercase",letterSpacing:"0.03em"}}>Registered — mid-claim</span>}
                </div>
                <div style={{fontSize:11.5,color:C.slate500}}>{act.organisation} · {act.location}</div>
                <span style={{fontSize:11,color:C.brand}}>{act.contactEmail}</span>
              </div>
              <div style={{display:"flex",gap:5,flexShrink:0}}>
                <button onClick={()=>{setDraftAct(act);setDraftType("claim");}} style={{padding:"5px 10px",borderRadius:7,border:`1px solid ${C.slate200}`,background:"#fff",color:C.slate500,fontSize:11.5,fontWeight:600,cursor:"pointer",fontFamily:F.body}} title="Draft a plain email to send yourself">Draft</button>
                <button onClick={()=>{setDraftAct(act);setDraftType("featured");}} style={{padding:"5px 10px",borderRadius:7,border:"1px solid #F59E0B",background:"#FEF3C7",color:"#D97706",fontSize:11.5,fontWeight:700,cursor:"pointer",fontFamily:F.body}}>⭐ Featured</button>
              </div>
            </div>
          ))}
        </div>}
      </div>

      {/* Email draft modal */}
      {draftAct&&(
        <Modal onClose={()=>setDraftAct(null)} maxWidth={520}>
          <h2 style={{margin:"0 0 4px",fontSize:18,fontWeight:700,color:C.slate900,fontFamily:F.display,paddingRight:32}}>
            {draftType==="claim"?"Claim outreach":"Featured upgrade"}
          </h2>
          <p style={{margin:"0 0 16px",fontSize:13,color:C.slate500}}>{draftAct.name} · {draftAct.contactEmail}</p>
          <div style={{background:C.slate50,borderRadius:10,padding:14,border:`1px solid ${C.slate200}`,marginBottom:16,maxHeight:280,overflowY:"auto"}}>
            <pre style={{margin:0,fontSize:12.5,color:C.slate700,fontFamily:"monospace",lineHeight:1.6,whiteSpace:"pre-wrap"}}>{draftType==="claim"?claimTemplate(draftAct):featuredTemplate(draftAct)}</pre>
          </div>
          <div style={{display:"flex",gap:8}}>
            <a href={`mailto:${draftAct.contactEmail}?subject=${encodeURIComponent(draftType==="claim"?`Claim your free listing on IncludeMe — ${draftAct.name}`:`Get priority placement on IncludeMe — ${draftAct.name}`)}&body=${encodeURIComponent(draftType==="claim"?claimTemplate(draftAct).split("\n").slice(2).join("\n"):featuredTemplate(draftAct).split("\n").slice(2).join("\n"))}`}
              style={{flex:1,padding:"10px",borderRadius:10,border:"none",background:C.brand,color:"white",fontWeight:700,fontSize:13.5,cursor:"pointer",fontFamily:F.body,textAlign:"center",textDecoration:"none",display:"block"}}>
              ✉️ Open in email client
            </a>
            <button onClick={()=>{navigator.clipboard&&navigator.clipboard.writeText(draftType==="claim"?claimTemplate(draftAct):featuredTemplate(draftAct));}} style={{padding:"10px 16px",borderRadius:10,border:`1.5px solid ${C.slate200}`,background:"#fff",color:C.slate600,fontWeight:600,fontSize:13,cursor:"pointer",fontFamily:F.body}}>Copy</button>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ─── Admin Updates Tab — announce features to registered businesses ────────
// Distinct from AdminOutreachTab above: this sends to real, already
// signed-up business accounts (a genuine product update), not cold outreach
// to unclaimed listings. Uses send-feature-update.js.
const AdminUpdatesTab=()=>{
  const [allUsers,setAllUsers]=useState([]);
  const [loading,setLoading]=useState(true);
  const [picked,setPicked]=useState(()=>new Set());
  const [subject,setSubject]=useState("");
  const [headline,setHeadline]=useState("");
  const [message,setMessage]=useState("");
  const [ctaText,setCtaText]=useState("");
  const [ctaUrl,setCtaUrl]=useState("https://includeme.uk");
  const [sendEmailChannel,setSendEmailChannel]=useState(true);
  const [sendInAppChannel,setSendInAppChannel]=useState(true);
  const [sending,setSending]=useState(false);
  const [sendResult,setSendResult]=useState("");
  const EXCLUDE_EMAILS=["coffeeatyourdoor@yahoo.com"]; // Paul's own test account
  useEffect(()=>{
    (async()=>{
      try{
        const keys=await store.list("user:");
        const all=await Promise.all((keys||[]).map(k=>store.get(k)));
        const real=all.filter(u=>u&&u.id&&u.email&&!EXCLUDE_EMAILS.includes(u.email)&&!/paul_admin/i.test(u.email));
        setAllUsers(real);
      }catch{setAllUsers([]);}
      setLoading(false);
    })();
  },[]);
  const toggle=(email)=>setPicked(p=>{const n=new Set(p);n.has(email)?n.delete(email):n.add(email);return n;});
  const selectAll=()=>setPicked(new Set(allUsers.map(u=>u.email)));
  const pickedList=allUsers.filter(u=>picked.has(u.email));
  const send=async()=>{
    if(!subject.trim()||!headline.trim()||!message.trim()){setSendResult("Please fill in subject, headline and message.");return;}
    if(!pickedList.length){setSendResult("Select at least one recipient first.");return;}
    if(!sendEmailChannel&&!sendInAppChannel){setSendResult("Select at least one delivery channel.");return;}
    setSending(true);setSendResult("");
    try{
      const{data:{session}}=await sb.auth.getSession();
      if(!session?.access_token){setSendResult("Sign in again to send.");setSending(false);return;}
      const res=await fetch(`${API_BASE}/.netlify/functions/send-feature-update`,{
        method:"POST",
        headers:{"Content-Type":"application/json",Authorization:`Bearer ${session.access_token}`},
        body:JSON.stringify({subject:subject.trim(),headline:headline.trim(),message:message.trim(),ctaText:ctaText.trim()||undefined,ctaUrl:ctaUrl.trim()||undefined,sendEmailChannel,sendInAppChannel,recipients:pickedList.map(u=>({email:u.email,userId:u.id,orgName:u.orgName||u.name}))})
      });
      if(res.ok){
        const b=await res.json();
        const parts=[];
        if(sendEmailChannel)parts.push(`${b.sent} email${b.sent!==1?"s":""}${b.failed?` (${b.failed} failed)`:""}`);
        if(sendInAppChannel)parts.push(`${b.inAppDelivered} in-app message${b.inAppDelivered!==1?"s":""}`);
        setSendResult(`✓ Sent — ${parts.join(", ")}.`);
        setPicked(new Set());
      }else{
        const b=await res.json().catch(()=>({}));
        setSendResult("Couldn't send: "+(b.error||res.status));
      }
    }catch(e){setSendResult("Couldn't send — is the site deployed? "+(e?.message||""));}
    setSending(false);
  };
  return(
    <div>
      <h3 style={{margin:"0 0 4px",fontSize:15,fontWeight:600,color:C.slate800}}>Announce to everyone</h3>
      <p style={{margin:"0 0 18px",fontSize:13,color:C.slate400}}>Send a feature update or announcement to registered users — families and businesses alike, delivered by email and/or in-app message.</p>

      <div style={{background:C.slate50,border:`1px solid ${C.slate100}`,borderRadius:10,padding:16,marginBottom:16}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
          <div>
            <label style={{fontSize:11,fontWeight:700,color:C.slate500,display:"block",marginBottom:4,textTransform:"uppercase",letterSpacing:"0.06em"}}>Email subject</label>
            <input value={subject} onChange={e=>setSubject(e.target.value)} placeholder="New on IncludeMe: in-app messaging" style={{width:"100%",padding:"8px 11px",borderRadius:8,border:`1.5px solid ${C.slate200}`,fontSize:13,fontFamily:F.body,color:C.slate800,boxSizing:"border-box"}}/>
          </div>
          <div>
            <label style={{fontSize:11,fontWeight:700,color:C.slate500,display:"block",marginBottom:4,textTransform:"uppercase",letterSpacing:"0.06em"}}>Headline</label>
            <input value={headline} onChange={e=>setHeadline(e.target.value)} placeholder="You can now message families directly" style={{width:"100%",padding:"8px 11px",borderRadius:8,border:`1.5px solid ${C.slate200}`,fontSize:13,fontFamily:F.body,color:C.slate800,boxSizing:"border-box"}}/>
          </div>
        </div>
        <label style={{fontSize:11,fontWeight:700,color:C.slate500,display:"block",marginBottom:4,textTransform:"uppercase",letterSpacing:"0.06em"}}>Message</label>
        <textarea value={message} onChange={e=>setMessage(e.target.value)} rows={5} placeholder="Write your update here. Leave a blank line between paragraphs." style={{width:"100%",padding:"9px 11px",borderRadius:8,border:`1.5px solid ${C.slate200}`,fontSize:13,fontFamily:F.body,color:C.slate800,lineHeight:1.5,resize:"vertical",boxSizing:"border-box",marginBottom:10}}/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
          <div>
            <label style={{fontSize:11,fontWeight:700,color:C.slate500,display:"block",marginBottom:4,textTransform:"uppercase",letterSpacing:"0.06em"}}>Button text (optional)</label>
            <input value={ctaText} onChange={e=>setCtaText(e.target.value)} placeholder="Try it now →" style={{width:"100%",padding:"8px 11px",borderRadius:8,border:`1.5px solid ${C.slate200}`,fontSize:13,fontFamily:F.body,color:C.slate800,boxSizing:"border-box"}}/>
          </div>
          <div>
            <label style={{fontSize:11,fontWeight:700,color:C.slate500,display:"block",marginBottom:4,textTransform:"uppercase",letterSpacing:"0.06em"}}>Button link</label>
            <input value={ctaUrl} onChange={e=>setCtaUrl(e.target.value)} placeholder="https://includeme.uk" style={{width:"100%",padding:"8px 11px",borderRadius:8,border:`1.5px solid ${C.slate200}`,fontSize:13,fontFamily:F.body,color:C.slate800,boxSizing:"border-box"}}/>
          </div>
        </div>
        <label style={{fontSize:11,fontWeight:700,color:C.slate500,display:"block",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.06em"}}>Delivery channels</label>
        <div style={{display:"flex",gap:16}}>
          <label style={{display:"flex",alignItems:"center",gap:7,fontSize:13,color:C.slate700,fontWeight:600,cursor:"pointer"}}>
            <input type="checkbox" checked={sendEmailChannel} onChange={e=>setSendEmailChannel(e.target.checked)} style={{width:16,height:16,accentColor:C.brand,cursor:"pointer"}}/>
            📧 Email
          </label>
          <label style={{display:"flex",alignItems:"center",gap:7,fontSize:13,color:C.slate700,fontWeight:600,cursor:"pointer"}}>
            <input type="checkbox" checked={sendInAppChannel} onChange={e=>setSendInAppChannel(e.target.checked)} style={{width:16,height:16,accentColor:C.brand,cursor:"pointer"}}/>
            💬 In-app message
          </label>
        </div>
      </div>

      <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",background:C.brandLt,border:"1px solid rgba(15,107,92,0.2)",borderRadius:10,padding:"10px 14px",marginBottom:12}}>
        <button onClick={selectAll} style={{padding:"6px 11px",borderRadius:7,border:`1px solid ${C.brand}`,background:"#fff",color:C.brand,fontSize:11.5,fontWeight:700,cursor:"pointer",fontFamily:F.body}}>Select all {allUsers.length}</button>
        <button onClick={()=>setPicked(new Set())} style={{padding:"6px 11px",borderRadius:7,border:`1px solid ${C.slate200}`,background:"#fff",color:C.slate500,fontSize:11.5,fontWeight:600,cursor:"pointer",fontFamily:F.body}}>Clear</button>
        <span style={{fontSize:12.5,color:C.slate600,fontWeight:600}}>{picked.size} selected</span>
        <div style={{flex:1}}/>
        <button onClick={send} disabled={sending||!picked.size} style={{padding:"8px 16px",borderRadius:8,border:"none",background:picked.size?C.brand:C.slate200,color:"#fff",fontSize:12.5,fontWeight:700,cursor:picked.size?"pointer":"default",fontFamily:F.body,opacity:sending?0.6:1}}>{sending?"Sending…":`Send to ${picked.size||""} recipient${picked.size!==1?"s":""}`}</button>
      </div>
      {sendResult&&<div style={{fontSize:12.5,color:sendResult.startsWith("✓")?C.brand:C.red,marginBottom:14,fontWeight:600}}>{sendResult}</div>}

      {loading?<p style={{fontSize:12.5,color:C.slate400}}>Loading users…</p>:allUsers.length===0?
        <div style={{textAlign:"center",padding:"24px 0",color:C.slate400,fontSize:13}}>No registered accounts yet.</div>
      :<div style={{display:"flex",flexDirection:"column",gap:6,maxHeight:"40vh",overflowY:"auto"}}>
        {allUsers.map(u=>(
          <div key={u.email} onClick={()=>toggle(u.email)} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 13px",borderRadius:9,border:`1px solid ${picked.has(u.email)?C.brand:C.slate200}`,background:picked.has(u.email)?C.brandLt:"#fff",cursor:"pointer"}}>
            <input type="checkbox" checked={picked.has(u.email)} readOnly style={{width:16,height:16,accentColor:C.brand,pointerEvents:"none",flexShrink:0}}/>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontWeight:600,fontSize:13,color:C.slate900}}>{u.orgName||u.name}</div>
              <div style={{fontSize:11.5,color:C.slate500}}>{u.email}</div>
            </div>
            <span style={{fontSize:10,fontWeight:700,color:u.accountType==="business"?C.brand:C.amber,background:u.accountType==="business"?C.brandLt:"#F6ECD8",borderRadius:99,padding:"2px 8px",flexShrink:0,textTransform:"uppercase",letterSpacing:"0.03em"}}>{u.accountType==="business"?"Business":"Family"}</span>
          </div>
        ))}
      </div>}
    </div>
  );
};

// ─── Admin daily email digest config ─────────────────────────────────────────
// ⚠️ SENDING SEAM: store.set("admin_email_sub", prefs) is the data model.
// A daily cron (e.g. Supabase Edge Function + Resend) reads this key and sends
// a digest to the configured admin email covering new sign-ups and pending requests.
const AdminEmailTab=({activities,users,requests})=>{
  const KEY="admin_email_sub";
  const [sub,setSub]=useState(null);
  const [email,setEmail]=useState("");
  const [sendTime,setSendTime]=useState("08:00");
  const [include,setInclude]=useState({newSignups:true,claimRequests:true,suggestions:true,enquiries:true});
  const [saving,setSaving]=useState(false);
  const [saved,setSaved]=useState(false);
  const fmt=d=>{if(!d)return"–";try{return new Date(d).toLocaleDateString("en-GB",{day:"numeric",month:"short"});}catch{return d;}};

  useEffect(()=>{
    store.get(KEY).then(v=>{
      if(v){setSub(v);setEmail(v.email||"");setSendTime(v.sendTime||"08:00");setInclude(v.include||{newSignups:true,claimRequests:true,suggestions:true,enquiries:true});}
    }).catch(()=>{});
  },[]);

  const save=async()=>{
    if(!email.trim())return;
    setSaving(true);
    const s={email:email.trim().toLowerCase(),sendTime,include,updatedAt:new Date().toISOString()};
    try{ await store.set(KEY,s); setSub(s); setSaved(true); setTimeout(()=>setSaved(false),3000); }catch{}
    setSaving(false);
  };

  // Build a preview of today's digest
  const today=new Date(); today.setHours(0,0,0,0);
  const isToday=d=>{const x=new Date(d);x.setHours(0,0,0,0);return x.getTime()===today.getTime();};
  const isThisWeek=d=>{const x=new Date(d);return (today-x)<7*86400000;};
  const newSignupsToday=users.filter(u=>isToday(u.createdAt));
  const newSignupsWeek=users.filter(u=>isThisWeek(u.createdAt));
  const pendingClaims=(requests.claims||[]).filter(r=>r.status==="pending");
  const pendingSuggestions=(requests.suggestions||[]).filter(r=>r.status==="pending");

  const Section=({icon,title,count,items,emptyMsg})=>(
    <div style={{marginBottom:16}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
        <span>{icon}</span>
        <span style={{fontWeight:700,fontSize:13,color:C.slate800}}>{title}</span>
        <span style={{background:count>0?C.brand:C.slate200,color:count>0?"#fff":C.slate500,borderRadius:99,padding:"1px 9px",fontSize:11,fontWeight:800}}>{count}</span>
      </div>
      {items.length>0?(
        <div style={{background:C.slate50,borderRadius:9,padding:"10px 12px",fontSize:12.5,color:C.slate700,lineHeight:1.6,border:`1px solid ${C.slate100}`}}>
          {items.slice(0,5).map((item,i)=><div key={i}>{item}</div>)}
          {items.length>5&&<div style={{color:C.slate400,fontSize:12}}>+{items.length-5} more</div>}
        </div>
      ):(
        <div style={{fontSize:12.5,color:C.slate400,fontStyle:"italic"}}>{emptyMsg}</div>
      )}
    </div>
  );

  return(
    <div>
      <h3 style={{margin:"0 0 4px",fontSize:15,fontWeight:600,color:C.slate800}}>Daily admin digest</h3>
      <p style={{margin:"0 0 20px",fontSize:13,color:C.slate400,lineHeight:1.5}}>
        Get a daily email with new sign-ups and pending requests so nothing slips through.<br/>
        <span style={{fontSize:11.5,color:C.slate400}}>⚠️ Email sending needs a backend (Supabase Edge Function + Resend). This saves the config so it's ready to wire up.</span>
      </p>

      {/* Config */}
      <div style={{background:C.slate50,borderRadius:12,padding:16,marginBottom:20,border:`1px solid ${C.slate200}`}}>
        <div style={{marginBottom:12}}>
          <label style={{fontSize:12,fontWeight:700,color:C.slate500,display:"block",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.06em"}}>Send digest to</label>
          <div style={{display:"flex",gap:8}}>
            <input style={{flex:1,padding:"9px 12px",border:`1.5px solid ${C.slate200}`,borderRadius:9,fontSize:13.5,fontFamily:F.body,outline:"none"}} type="email" placeholder="admin@includeme.uk" value={email} onChange={e=>setEmail(e.target.value)}/>
            <input style={{width:90,padding:"9px 12px",border:`1.5px solid ${C.slate200}`,borderRadius:9,fontSize:13.5,fontFamily:F.body,outline:"none"}} type="time" value={sendTime} onChange={e=>setSendTime(e.target.value)}/>
          </div>
        </div>
        <div style={{marginBottom:14}}>
          <label style={{fontSize:12,fontWeight:700,color:C.slate500,display:"block",marginBottom:8,textTransform:"uppercase",letterSpacing:"0.06em"}}>Include in digest</label>
          {[["newSignups","👤 New sign-ups"],["claimRequests","🔑 Claim requests"],["suggestions","💡 Suggested activities"],["enquiries","✉️ Provider enquiries"]].map(([k,lbl])=>(
            <label key={k} style={{display:"flex",alignItems:"center",gap:9,marginBottom:7,cursor:"pointer",fontSize:13,color:C.slate700}}>
              <input type="checkbox" checked={include[k]} onChange={()=>setInclude(p=>({...p,[k]:!p[k]}))} style={{accentColor:C.brand,width:15,height:15}}/>
              {lbl}
            </label>
          ))}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <Btn loading={saving} disabled={!email.trim()} onClick={save}>Save digest settings</Btn>
          {saved&&<span style={{fontSize:12.5,color:C.brand,fontWeight:600}}>✓ Saved</span>}
          {sub&&<span style={{fontSize:12,color:C.slate400}}>Sending to {sub.email} at {sub.sendTime}</span>}
        </div>
      </div>

      {/* Live preview of today's digest content */}
      <div style={{borderTop:`1px solid ${C.slate100}`,paddingTop:16}}>
        <div style={{fontSize:12,fontWeight:700,color:C.slate500,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:14}}>Today's digest preview</div>
        <Section icon="👤" title="New sign-ups today" count={newSignupsToday.length}
          items={newSignupsToday.map(u=>`${u.name||u.email} (${u.accountType}) — joined today`)}
          emptyMsg="No new sign-ups today"/>
        <Section icon="📅" title="Sign-ups this week" count={newSignupsWeek.length}
          items={newSignupsWeek.map(u=>`${u.name||u.email} (${u.accountType}) — ${fmt(u.createdAt)}`)}
          emptyMsg="No sign-ups this week"/>
        <Section icon="🔑" title="Pending claim requests" count={pendingClaims.length}
          items={pendingClaims.map(r=>`${r.orgName||r.userId} → ${r.actName||r.actId}`)}
          emptyMsg="No pending claims — you're up to date"/>
        <Section icon="💡" title="Pending suggestions" count={pendingSuggestions.length}
          items={pendingSuggestions.map(r=>`${r.name||"Unnamed"} — submitted by ${r.submittedBy||"family"}`)}
          emptyMsg="No pending suggestions"/>
      </div>
    </div>
  );
};

const ADMIN_PASS="includeme-admin";

// ─── Admin Panel (comprehensive) ─────────────────────────────────────────────
const AdminPanel=({activities,setActivities,onClose})=>{
  const [authed,setAuthed]=useState(false);
  const [pw,setPw]=useState(""); const [pwErr,setPwErr]=useState("");
  const [tab,setTab]=useState("dashboard");
  const [requests,setRequests]=useState({claims:[],verifies:[],featured:[],suggestions:[],reports:[]});
  const [users,setUsers]=useState([]);
  const [listSearch,setListSearch]=useState("");
  const [listFilter,setListFilter]=useState({tier:"all",type:"all",county:"all",owner:"all"});
  const [selected,setSelected]=useState(new Set());
  const [verifyTarget,setVerifyTarget]=useState(null);
  const [adminEnquiries,setAdminEnquiries]=useState([]);
  useEffect(()=>{
    // Load all provider enquiries for the admin inbox
    store.list("enquiries:").then(async keys=>{
      const all=[];
      for(const k of keys){const v=await store.get(k);if(v)all.push(...v.map(e=>({...e,_providerKey:k})));}
      setAdminEnquiries(all.sort((a,b)=>b.sentAt.localeCompare(a.sentAt)));
    }).catch(()=>{});
  },[]);
  const [loading,setLoading]=useState(false);
  const [msg,setMsg]=useState("");
  const [actionLog,setActionLog]=useState([]);

  const log=(txt)=>{
    const entry={txt,ts:new Date().toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"})};
    setActionLog(p=>[entry,...p].slice(0,20));
    setMsg(txt);setTimeout(()=>setMsg(""),3000);
  };

  const loadAll=async()=>{
    setLoading(true);
    try{
      const[ck,vk,fk,uk,sk,rk]=await Promise.all([store.list("claim:"),store.list("verify-request:"),store.list("featured-request:"),store.list("user:"),store.list("suggestion:"),store.list("report:")]);
      const[cv,vv,fv,uv,sv,rv]=await Promise.all([
        Promise.all(ck.map(k=>store.get(k))),
        Promise.all(vk.map(k=>store.get(k))),
        Promise.all(fk.map(k=>store.get(k))),
        Promise.all(uk.map(async k=>{const v=await store.get(k);return v?{...v,_key:k}:null;})),
        Promise.all(sk.map(async k=>{const v=await store.get(k);return v?{...v,_key:k}:null;})),
        Promise.all(rk.map(k=>store.get(k))),
      ]);
      setRequests({
        claims:cv.filter(Boolean).sort((a,b)=>new Date(b.submittedAt||0)-new Date(a.submittedAt||0)),
        verifies:vv.filter(Boolean).sort((a,b)=>new Date(b.requestedAt||0)-new Date(a.requestedAt||0)),
        featured:fv.filter(Boolean).sort((a,b)=>new Date(b.requestedAt||0)-new Date(a.requestedAt||0)),
        suggestions:sv.filter(Boolean).sort((a,b)=>new Date(b.at||0)-new Date(a.at||0)),
        reports:rv.filter(Boolean).sort((a,b)=>(b.reportedAt||0)-(a.reportedAt||0)),
      });
      setUsers(uv.filter(Boolean).sort((a,b)=>new Date(b.createdAt||0)-new Date(a.createdAt||0)));
    }catch(e){console.error(e);}
    setLoading(false);
  };

  useEffect(()=>{if(authed)loadAll();},[authed]);

  /* ── Approve / reject helpers ── */
  const approveClaim=async req=>{
    try{
      const act=activities.find(a=>a.id===req.actId);
      if(act){const u={...act,ownerId:req.userId};await store.set(`activity:${req.actId}`,u);setActivities(p=>p.map(a=>a.id===req.actId?u:a));}
      await store.set(`claim:${req.actId}`,{...req,status:"approved"});
      log(`✓ Claim approved — ${req.actName}`); loadAll();
    }catch{log("Error approving claim");}
  };
  const approveVerify=async req=>{
    try{
      const act=activities.find(a=>a.id===req.actId);
      if(act){const u={...act,verifiedPaid:true};await store.set(`activity:${req.actId}`,u);setActivities(p=>p.map(a=>a.id===req.actId?u:a));}
      await store.set(`verify-request:${req.actId}`,{...req,status:"approved"});
      log(`✓ Verified — ${req.actName||req.orgName}`); loadAll();
    }catch{log("Error");}
  };
  const approveFeatured=async req=>{
    try{
      const act=activities.find(a=>a.id===req.actId);
      if(act){const u={...act,featured:true,verifiedPaid:true};await store.set(`activity:${req.actId}`,u);setActivities(p=>p.map(a=>a.id===req.actId?u:a));}
      await store.set(`featured-request:${req.actId}`,{...req,status:"approved"});
      log(`⭐ Featured activated — ${req.actName||req.orgName}`); loadAll();
    }catch{log("Error");}
  };
  const rejectReq=async(prefix,id,req)=>{
    await store.set(`${prefix}${id}`,{...req,status:"rejected"});
    log("Rejected"); loadAll();
  };

  const dismissReport=async report=>{
    try{ await store.set(`report:${report.id}`,{...report,status:"dismissed"}); log("Report dismissed"); loadAll(); }
    catch{log("Error dismissing report");}
  };
  const removeReportedContent=async report=>{
    try{
      const RKEY=`reviews_${String(report.actId).replace(/[^a-zA-Z0-9]/g,"_")}`;
      const list=(await store.get(RKEY))||[];
      let updated;
      if(report.targetType==="response"){
        const reviewId=report.targetId.replace(/^resp-/,"");
        updated=list.map(r=>{ if(r.id!==reviewId)return r; const {response,...rest}=r; return rest; });
      }else{
        updated=list.filter(r=>r.id!==report.targetId);
      }
      await store.set(RKEY,updated);
      REVIEW_CACHE[RKEY]=updated;
      await store.set(`report:${report.id}`,{...report,status:"removed"});
      log("Content removed"); loadAll();
    }catch{log("Error removing content");}
  };
  const blockUser=async u=>{
    if(!u?._key)return;
    try{ await store.set(u._key,{...u,blocked:true}); log(`Blocked ${u.email}`); loadAll(); }
    catch{log("Error blocking user");}
  };
  const unblockUser=async u=>{
    if(!u?._key)return;
    try{ await store.set(u._key,{...u,blocked:false}); log(`Unblocked ${u.email}`); loadAll(); }
    catch{log("Error unblocking user");}
  };
  const setSuggestionStatus=async(s,status)=>{
    try{await store.set(s._key,{...s,status});}catch{}
    setRequests(p=>({...p,suggestions:p.suggestions.map(x=>x._key===s._key?{...x,status}:x)}));
    log(`Suggestion ${status==="added"?"marked added":"dismissed"}`);
  };
  const unclaimListing=async(act)=>{
    if(!window.confirm(`Remove the claim on "${act.name}"? It will return to an unclaimed seed listing.`))return;
    const u={...act,ownerId:"seed"};
    await store.set(`activity:${act.id}`,u);
    setActivities(p=>p.map(a=>a.id===act.id?u:a));
    // also clear any approved claim record so it can be re-claimed
    try{await store.set(`claim:${act.id}`,{actId:act.id,status:"removed",removedAt:new Date().toISOString()});}catch{}
    log(`Claim removed from ${act.name}`);
  };
  const toggleTier=async(actId,field)=>{
    const act=activities.find(a=>a.id===actId); if(!act)return;
    const u={...act,[field]:!act[field]};
    if(field==="featured"&&!act.featured)u.verifiedPaid=true;
    await store.set(`activity:${actId}`,u);
    setActivities(p=>p.map(a=>a.id===actId?u:a));
    log(`Updated ${act.name}`);
  };
  const deleteListing=async actId=>{
    if(!confirm("Delete this listing permanently? This cannot be undone."))return;
    await store.del(`activity:${actId}`);
    setActivities(p=>p.filter(a=>a.id!==actId));
    log("Listing deleted");
  };
  const deleteUser=async email=>{
    if(!confirm(`Delete user ${email}? This cannot be undone.`))return;
    await store.del(`user:${email}`);
    setUsers(p=>p.filter(u=>u.email!==email));
    log(`User ${email} deleted`);
  };

  /* ── Export helpers ── */
  const exportCSV=(rows,filename)=>{
    const header=Object.keys(rows[0]).join(",");
    const body=rows.map(r=>Object.values(r).map(v=>`"${String(v||"").replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob=new Blob([header+"\n"+body],{type:"text/csv"});
    const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=filename;a.click();
    log(`Exported ${filename}`);
  };

  /* ── Derived stats ── */
  const featured=activities.filter(a=>a.featured);
  const verified=activities.filter(a=>a.verifiedPaid&&!a.featured);
  const free=activities.filter(a=>!a.featured&&!a.verifiedPaid);
  const claimed=activities.filter(a=>a.ownerId&&a.ownerId!=="seed");
  const hasEmail=activities.filter(a=>a.contactEmail&&!a.contactEmail.includes("via website"));
  const pending=requests.claims.filter(r=>r.status==="pending").length+requests.verifies.filter(r=>r.status==="pending").length+requests.featured.filter(r=>r.status==="pending").length+requests.suggestions.filter(r=>r.status==="new").length;
  const pendingReports=requests.reports.filter(r=>r.status==="pending").length;
  const estMRR=featured.length*49+verified.length*15;

  /* ── Listings filter ── */
  const counties=[...new Set(activities.map(a=>a.location||"").filter(Boolean))].sort();
  const listFiltered=activities.filter(a=>{
    if(listSearch){const h=listSearch.toLowerCase();if(![(a.name||""),(a.organisation||""),(a.location||"")].some(s=>s.toLowerCase().includes(h)))return false;}
    if(listFilter.tier==="featured"&&!a.featured)return false;
    if(listFilter.tier==="verified"&&!(a.verifiedPaid&&!a.featured))return false;
    if(listFilter.tier==="free"&&(a.featured||a.verifiedPaid))return false;
    if(listFilter.type==="activity"&&(a.category==="therapy"||a.category==="charity"))return false;
    if(listFilter.type==="therapy"&&a.category!=="therapy")return false;
    if(listFilter.type==="charity"&&a.category!=="charity")return false;
    if(listFilter.county!=="all"&&a.location!==listFilter.county)return false;
    if(listFilter.owner==="claimed"&&(!a.ownerId||a.ownerId==="seed"))return false;
    if(listFilter.owner==="unclaimed"&&a.ownerId&&a.ownerId!=="seed")return false;
    if(listFilter.owner==="noemail"&&a.contactEmail&&!a.contactEmail.includes("via website"))return false;
    return true;
  });

  const fmtDate=d=>{if(!d)return"–";try{return new Date(d).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"});}catch{return d;}};

  const TierPill=({act,small})=>{
    const s=small?{padding:"2px 7px",fontSize:10}:{padding:"3px 9px",fontSize:11};
    if(act.featured)return <span style={{...s,background:"linear-gradient(135deg,#F59E0B,#D97706)",color:"#fff",borderRadius:5,fontWeight:700}}>⭐ Featured</span>;
    if(act.verifiedPaid||act.verified)return <span style={{...s,background:"linear-gradient(135deg,#0F6B5C,#2A8C7B)",color:"#fff",borderRadius:5,fontWeight:700}}>✓ Verified</span>;
    if(act.ownerId&&act.ownerId!=="seed")return <span style={{...s,background:C.slate200,color:C.slate600,borderRadius:5,fontWeight:700}}>Claimed</span>;
    return <span style={{...s,background:C.slate100,color:C.slate500,borderRadius:5,fontWeight:600}}>Free</span>;
  };

  const StatBox=({icon,label,val,sub,color})=>(
    <div style={{background:C.white,borderRadius:12,padding:"14px 16px",border:`1px solid ${C.slate200}`,minWidth:0}}>
      <div style={{fontSize:22,marginBottom:4}}>{icon}</div>
      <div style={{fontSize:26,fontWeight:700,color:color||C.slate900,fontFamily:F.display,lineHeight:1}}>{val}</div>
      <div style={{fontSize:11,color:C.slate400,marginTop:3}}>{label}</div>
      {sub&&<div style={{fontSize:10.5,color:C.brand,marginTop:2,fontWeight:600}}>{sub}</div>}
    </div>
  );

  const ReqCard=({req,type,onApprove,onReject})=>{
    const act=activities.find(a=>a.id===req.actId);
    const isPending=req.status==="pending";
    return(
      <div style={{border:`1px solid ${isPending?"#CBD5E1":C.slate200}`,borderLeft:`3px solid ${isPending?C.brand:"#CBD5E1"}`,borderRadius:10,padding:"14px 16px",background:isPending?C.brandLt:"#fafaf9",marginBottom:8}}>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:8,marginBottom:isPending?10:0}}>
          <div style={{flex:1}}>
            <div style={{fontWeight:700,fontSize:14,color:C.slate900,marginBottom:2}}>{req.actName||req.orgName||req.actId}</div>
            {type==="claim"&&<div style={{fontSize:12.5,color:C.slate600}}>{req.claimantName} · <em>{req.role}</em></div>}
            <div style={{fontSize:12,color:C.slate500,marginTop:2}}>📧 {type==="claim"?req.email:req.email}</div>
            <div style={{fontSize:11,color:C.slate400,marginTop:2}}>{fmtDate(req.submittedAt||req.requestedAt)}{act?` · listing currently ${act.featured?"Featured":act.verifiedPaid?"Verified":"Free"}`:""}</div>
          </div>
          <span style={{flexShrink:0,padding:"3px 10px",borderRadius:6,fontSize:11,fontWeight:700,
            background:req.status==="approved"?"#DCFCE7":req.status==="rejected"?"#FEE2E2":"#FEF9C3",
            color:req.status==="approved"?"#15803D":req.status==="rejected"?"#DC2626":"#B45309"}}>
            {req.status||"pending"}
          </span>
        </div>
        {isPending&&(
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            <Btn size="sm" onClick={()=>onApprove(req)}>✓ Approve</Btn>
            <Btn variant="danger" size="sm" onClick={()=>onReject(req)}>✗ Reject</Btn>
            {req.email&&<a href={`mailto:${req.email}?subject=Your ${type==="claim"?"listing claim":"upgrade request"} on IncludeMe&body=Hi ${req.claimantName||"there"},%0A%0AThank you for your request regarding ${req.actName||req.orgName} on IncludeMe.%0A%0A`} style={{fontSize:12,color:C.brand,fontWeight:600,marginLeft:4,textDecoration:"none"}} target="_blank">✉ Email →</a>}
          </div>
        )}
      </div>
    );
  };

  if(!authed)return(
    <Modal onClose={onClose} maxWidth={380}>
      <h3 style={{margin:"0 0 6px",fontFamily:F.display,fontSize:20,fontWeight:600}}>Admin Access</h3>
      <p style={{color:C.slate400,fontSize:13,margin:"0 0 20px"}}>Enter the admin password to continue.</p>
      <Field label="Password">
        <input type="password" style={inputStyle} value={pw} autoFocus
          onChange={e=>setPw(e.target.value)}
          onKeyDown={e=>{if(e.key==="Enter"){if(pw===ADMIN_PASS){setAuthed(true);setPwErr("");}else setPwErr("Incorrect password.");}}}
          placeholder="Admin password"/>
      </Field>
      {pwErr&&<p style={{color:C.red,fontSize:13,margin:"0 0 12px"}}>{pwErr}</p>}
      <Btn full onClick={()=>{if(pw===ADMIN_PASS){setAuthed(true);setPwErr("");}else setPwErr("Incorrect password.")}}>Enter →</Btn>
    </Modal>
  );

  const tabs=[
    {id:"dashboard",icon:"📊",label:"Dashboard"},
    {id:"requests",icon:"📥",label:pending>0?`Requests (${pending})`:"Requests"},
    {id:"reports",icon:"🚩",label:pendingReports>0?`Reports (${pendingReports})`:"Reports"},
    {id:"listings",icon:"🗂",label:"Listings"},
    {id:"users",icon:"👤",label:`Users (${users.length})`},
    {id:"feed",icon:"📡",label:"Feed"},
    {id:"enquiries",icon:"✉️",label:"Enquiries"},
    {id:"outreach",icon:"📤",label:"Outreach"},
    {id:"updates",icon:"📣",label:"Updates"},
    {id:"revenue",icon:"💰",label:"Revenue"},
    {id:"export",icon:"⬇",label:"Export"},
    {id:"email",icon:"🔔",label:"Digest"},
  ];

  return(
    <Modal onClose={onClose} maxWidth={780}>
      {/* Header bar */}
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:18,paddingRight:32}}>
        <div style={{flex:1}}>
          <h2 style={{margin:0,fontFamily:F.display,fontSize:21,fontWeight:700,color:C.slate900}}>IncludeMe Admin</h2>
          <p style={{margin:0,fontSize:12,color:C.slate400}}>{activities.length} listings · {users.length} registered users</p>
        </div>
        {msg&&<div style={{background:C.brandLt,color:C.brand,padding:"6px 14px",borderRadius:8,fontSize:12.5,fontWeight:600,flexShrink:0}}>{msg}</div>}
        <button onClick={loadAll} style={{padding:"6px 12px",borderRadius:8,border:`1px solid ${C.slate200}`,background:"#fff",fontSize:12,cursor:"pointer",color:C.slate500,fontFamily:F.body}}>{loading?"…":"↻ Refresh"}</button>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",gap:0,borderBottom:`1px solid ${C.slate100}`,marginBottom:20,overflowX:"auto"}}>
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"9px 13px",border:"none",borderBottom:tab===t.id?`2px solid ${C.brand}`:"2px solid transparent",background:"none",cursor:"pointer",fontSize:12.5,fontWeight:tab===t.id?700:500,color:tab===t.id?C.brand:C.slate400,display:"flex",alignItems:"center",gap:4,whiteSpace:"nowrap",fontFamily:F.body}}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── DASHBOARD ── */}
      {tab==="dashboard"&&(
        <div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:16}}>
            <StatBox icon="💰" label="Est. monthly revenue" val={`£${estMRR.toLocaleString()}`} sub="Before Stripe fees" color={estMRR>0?C.brand:C.slate400}/>
            <StatBox icon="📋" label="Total listings" val={activities.length}/>
            <StatBox icon="📥" label="Pending requests" val={pending} color={pending>0?"#D97706":C.slate400}/>
            <StatBox icon="⭐" label="Featured listings" val={featured.length} sub={`£${featured.length*49}/mo potential`}/>
            <StatBox icon="✓" label="Verified listings" val={verified.length} sub={`£${verified.length*15}/mo potential`}/>
            <StatBox icon="🆓" label="Free listings" val={free.length} sub={`${Math.round(free.length/activities.length*100)}% of directory`}/>
            <StatBox icon="🔐" label="Claimed listings" val={claimed.length}/>
            <StatBox icon="📧" label="With real email" val={hasEmail.length} sub={`${activities.length-hasEmail.length} contact-form only`}/>
            <StatBox icon="👤" label="Registered users" val={users.length}/>
          </div>
          {/* Action log */}
          <div style={{background:C.slate50,borderRadius:10,padding:"12px 16px",border:`1px solid ${C.slate200}`}}>
            <div style={{fontSize:11,fontWeight:700,color:C.slate400,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:8}}>Recent Admin Actions</div>
            {actionLog.length===0&&<div style={{color:C.slate400,fontSize:13}}>No actions yet this session.</div>}
            {actionLog.map((a,i)=>(
              <div key={i} style={{display:"flex",gap:10,fontSize:12.5,color:C.slate600,marginBottom:4}}>
                <span style={{color:C.slate400,flexShrink:0}}>{a.ts}</span>{a.txt}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── REQUESTS ── */}
      {tab==="requests"&&(
        <div style={{maxHeight:"70vh",overflowY:"auto"}}>
          {loading&&<p style={{color:C.slate400,textAlign:"center",padding:24}}>Loading…</p>}
          {!loading&&(
            <>
              <div style={{marginBottom:20}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                  <h4 style={{margin:0,fontSize:12,fontWeight:700,color:C.slate500,textTransform:"uppercase",letterSpacing:"0.07em"}}>Claim Requests — {requests.claims.filter(r=>r.status==="pending").length} pending</h4>
                  {requests.claims.filter(r=>r.status==="pending").length>1&&(
                    <button onClick={async()=>{for(const r of requests.claims.filter(r=>r.status==="pending"))await approveClaim(r);}} style={{fontSize:11.5,padding:"4px 10px",borderRadius:6,border:`1px solid ${C.brand}`,background:C.brandLt,color:C.brand,cursor:"pointer",fontWeight:700,fontFamily:F.body}}>Approve all</button>
                  )}
                </div>
                {requests.claims.length===0&&<p style={{color:C.slate400,fontSize:13}}>No claim requests yet.</p>}
                {requests.claims.map((r,i)=><ReqCard key={i} req={r} type="claim" onApprove={approveClaim} onReject={req=>rejectReq("claim:",req.actId,req)}/>)}
              </div>
              <div style={{marginBottom:20}}>
                <h4 style={{margin:"0 0 10px",fontSize:12,fontWeight:700,color:C.slate500,textTransform:"uppercase",letterSpacing:"0.07em"}}>Verification Requests £15/mo — {requests.verifies.filter(r=>r.status==="pending").length} pending</h4>
                {requests.verifies.length===0&&<p style={{color:C.slate400,fontSize:13}}>No verification requests yet.</p>}
                {requests.verifies.map((r,i)=><ReqCard key={i} req={r} type="verify" onApprove={approveVerify} onReject={req=>rejectReq("verify-request:",req.actId,req)}/>)}
              </div>
              <div>
                <h4 style={{margin:"0 0 10px",fontSize:12,fontWeight:700,color:C.slate500,textTransform:"uppercase",letterSpacing:"0.07em"}}>Featured Upgrade Requests £49/mo — {requests.featured.filter(r=>r.status==="pending").length} pending</h4>
                {requests.featured.length===0&&<p style={{color:C.slate400,fontSize:13}}>No featured requests yet.</p>}
                {requests.featured.map((r,i)=><ReqCard key={i} req={r} type="featured" onApprove={approveFeatured} onReject={req=>rejectReq("featured-request:",req.actId,req)}/>)}
              </div>
              <div>
                <h4 style={{margin:"0 0 10px",fontSize:12,fontWeight:700,color:C.slate500,textTransform:"uppercase",letterSpacing:"0.07em"}}>Suggested Clubs (from families) — {requests.suggestions.filter(r=>r.status==="new").length} new</h4>
                {requests.suggestions.length===0&&<p style={{color:C.slate400,fontSize:13}}>No club suggestions yet.</p>}
                {requests.suggestions.map((s,i)=>(
                  <div key={s._key||i} style={{border:`1px solid ${C.slate200}`,borderRadius:10,padding:"12px 14px",marginBottom:8,opacity:s.status==="new"?1:0.6}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10}}>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontWeight:600,fontSize:14,color:C.slate900}}>{s.name}{s.status!=="new"&&<span style={{fontSize:11,fontWeight:700,color:C.slate400,marginLeft:8}}>· {s.status}</span>}</div>
                        <div style={{fontSize:12.5,color:C.slate500,marginTop:2}}>{s.location||"No area given"}{s.url?<> · <a href={s.url} target="_blank" rel="noreferrer" style={{color:C.brand}}>link</a></>:""}</div>
                        {s.note&&<div style={{fontSize:12.5,color:C.slate600,marginTop:6,fontStyle:"italic"}}>"{s.note}"</div>}
                        <div style={{fontSize:11,color:C.slate400,marginTop:6}}>from {s.by} · {s.at?new Date(s.at).toLocaleDateString("en-GB"):""}</div>
                      </div>
                      {s.status==="new"&&(
                        <div style={{display:"flex",flexDirection:"column",gap:6,flexShrink:0}}>
                          <button onClick={()=>setSuggestionStatus(s,"added")} style={{padding:"6px 12px",borderRadius:7,border:`1px solid ${C.brand}`,background:C.brandLt,color:C.brand,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:F.body}}>Mark added</button>
                          <button onClick={()=>setSuggestionStatus(s,"dismissed")} style={{padding:"6px 12px",borderRadius:7,border:`1px solid ${C.slate200}`,background:C.white,color:C.slate500,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:F.body}}>Dismiss</button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── REPORTS ── */}
      {tab==="reports"&&(
        <div>
          <div style={{fontSize:12,color:C.slate400,marginBottom:12}}>{requests.reports.length} reports total · {pendingReports} pending</div>
          {requests.reports.length===0?(
            <p style={{fontSize:13,color:C.slate400,textAlign:"center",padding:"24px 0"}}>No reports yet.</p>
          ):(
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {requests.reports.map(r=>(
                <div key={r.id} style={{padding:"12px 14px",borderRadius:10,border:`1px solid ${r.status==="pending"?"#FDBA74":C.slate200}`,background:r.status==="pending"?"#FFF7ED":C.white}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8,marginBottom:6,flexWrap:"wrap"}}>
                    <div>
                      <span style={{fontSize:11,fontWeight:700,color:C.slate500,textTransform:"uppercase"}}>{r.targetType==="listing"?"Listing data":r.targetType==="response"?"Owner response":"Review"} · {r.actId}</span>
                      <div style={{fontSize:11,color:C.slate400,marginTop:2}}>Reported by {r.reporterName||r.reporterId} · {r.reason}</div>
                    </div>
                    <span style={{fontSize:10.5,fontWeight:700,padding:"2px 8px",borderRadius:5,background:r.status==="pending"?"#FED7AA":r.status==="removed"?"#FECACA":"#E5E7EB",color:r.status==="pending"?"#C2410C":r.status==="removed"?"#B91C1C":"#6B7280",textTransform:"uppercase"}}>{r.status}</span>
                  </div>
                  <p style={{margin:"0 0 6px",fontSize:13,color:C.slate700,background:C.slate50,borderRadius:6,padding:"8px 10px"}}>"{r.targetText}"</p>
                  {r.details&&<p style={{margin:"0 0 8px",fontSize:12,color:C.slate500}}>Reporter's note: {r.details}</p>}
                  {r.status==="pending"&&(
                    <div style={{display:"flex",gap:8,marginTop:6}}>
                      {r.targetType!=="listing"&&<button onClick={()=>removeReportedContent(r)} style={{padding:"6px 12px",borderRadius:7,border:"none",background:C.red,color:"white",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:F.body}}>Remove content</button>}
                      {r.targetType==="listing"&&<button onClick={()=>{setTab("listings");setListSearch(r.actId);}} style={{padding:"6px 12px",borderRadius:7,border:`1px solid ${C.brand}`,background:C.brandLt,color:C.brand,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:F.body}}>Open in Listings →</button>}
                      <button onClick={()=>dismissReport(r)} style={{padding:"6px 12px",borderRadius:7,border:`1px solid ${C.slate200}`,background:C.white,color:C.slate500,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:F.body}}>Dismiss</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── LISTINGS ── */}
      {tab==="listings"&&(
        <div>
          {/* Bulk action bar */}
          {selected.size>0&&(
            <div style={{display:"flex",alignItems:"center",gap:8,background:C.brand,borderRadius:9,padding:"8px 12px",marginBottom:10}}>
              <span style={{color:"#fff",fontSize:13,fontWeight:700,flex:1}}>{selected.size} selected</span>
              <button onClick={()=>{selected.forEach(id=>toggleTier(id,"verifiedPaid"));setSelected(new Set());}} style={{padding:"5px 12px",borderRadius:6,border:"none",background:"#fff",color:C.brand,fontSize:12,fontWeight:700,cursor:"pointer"}}>✓ Verify all</button>
              <button onClick={()=>{selected.forEach(id=>toggleTier(id,"featured"));setSelected(new Set());}} style={{padding:"5px 12px",borderRadius:6,border:"none",background:"#FEF3C7",color:"#D97706",fontSize:12,fontWeight:700,cursor:"pointer"}}>⭐ Feature all</button>
              <button onClick={()=>setSelected(new Set())} style={{padding:"5px 10px",borderRadius:6,border:"1px solid rgba(255,255,255,0.3)",background:"transparent",color:"#fff",fontSize:12,cursor:"pointer"}}>✕ Clear</button>
            </div>
          )}
          {/* Filters */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8,marginBottom:10}}>
            <input value={listSearch} onChange={e=>setListSearch(e.target.value)} placeholder="Search name / org / location…" style={{...inputStyle,marginBottom:0,fontSize:12.5,padding:"7px 11px"}}/>
            <select value={listFilter.tier} onChange={e=>setListFilter(f=>({...f,tier:e.target.value}))} style={{...inputStyle,marginBottom:0,fontSize:12.5,padding:"7px 11px"}}>
              <option value="all">All tiers</option><option value="featured">Featured</option><option value="verified">Verified</option><option value="free">Free</option>
            </select>
            <select value={listFilter.type} onChange={e=>setListFilter(f=>({...f,type:e.target.value}))} style={{...inputStyle,marginBottom:0,fontSize:12.5,padding:"7px 11px"}}>
              <option value="all">All types</option><option value="activity">Activities</option><option value="therapy">Therapies</option><option value="charity">Charities</option>
            </select>
            <select value={listFilter.owner} onChange={e=>setListFilter(f=>({...f,owner:e.target.value}))} style={{...inputStyle,marginBottom:0,fontSize:12.5,padding:"7px 11px"}}>
              <option value="all">All ownership</option><option value="claimed">Claimed</option><option value="unclaimed">Unclaimed</option><option value="noemail">No email</option>
            </select>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
            <label style={{display:"flex",alignItems:"center",gap:6,fontSize:12,color:C.slate500,cursor:"pointer"}}>
              <input type="checkbox" checked={selected.size===listFiltered.length&&listFiltered.length>0} onChange={e=>setSelected(e.target.checked?new Set(listFiltered.map(a=>a.id)):new Set())} style={{accentColor:C.brand}}/>
              Select all
            </label>
            <span style={{fontSize:11.5,color:C.slate400}}>{listFiltered.length} of {activities.length} listings</span>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:5,maxHeight:"60vh",overflowY:"auto"}}>
            {listFiltered.map(act=>(
              <div key={act.id} style={{display:"flex",alignItems:"center",gap:8,padding:"9px 12px",borderRadius:9,border:`1px solid ${selected.has(act.id)?"#2563EB":act.featured?"#F6C96A":C.slate200}`,background:selected.has(act.id)?"#EFF6FF":act.featured?"#FFFCF0":"#fff"}}>
                <input type="checkbox" checked={selected.has(act.id)} onChange={e=>{const s=new Set(selected);e.target.checked?s.add(act.id):s.delete(act.id);setSelected(s);}} style={{accentColor:C.brand,flexShrink:0}}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:600,fontSize:13,color:C.slate900,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{act.name}</div>
                  <div style={{fontSize:11,color:C.slate400}}>{act.organisation} · {act.location}{act.contactEmail&&!act.contactEmail.includes("via website")?` · ${act.contactEmail}`:` · no email`}</div>
                </div>
                <TierPill act={act} small/>
                <div style={{display:"flex",gap:4,flexShrink:0}}>
                  <button onClick={()=>setVerifyTarget(act)} style={{padding:"3px 8px",borderRadius:5,border:`1.5px solid ${act.verified?"#0F6B5C":C.slate200}`,background:act.verified?"#E4F0ED":"#fff",color:act.verified?"#0F6B5C":C.slate400,fontSize:10.5,fontWeight:700,cursor:"pointer",fontFamily:F.body}} title="Verify">✓</button>
                  <button onClick={()=>toggleTier(act.id,"featured")} style={{padding:"3px 8px",borderRadius:5,border:`1.5px solid ${act.featured?"#F59E0B":C.slate200}`,background:act.featured?"#FEF3C7":"#fff",color:act.featured?"#D97706":C.slate400,fontSize:10.5,fontWeight:700,cursor:"pointer",fontFamily:F.body}}>⭐</button>
                  <button onClick={()=>toggleTier(act.id,"notifyOnPublish")} title={act.notifyOnPublish?"Flagged — will be sent on next Publish":"Flag for notification feed"} style={{padding:"3px 8px",borderRadius:5,border:`1.5px solid ${act.notifyOnPublish?"#0EA5E9":C.slate200}`,background:act.notifyOnPublish?"#E0F2FE":"#fff",color:act.notifyOnPublish?"#0369A1":C.slate400,fontSize:10.5,fontWeight:700,cursor:"pointer",fontFamily:F.body}}>🔔</button>
                  {act.ownerId&&act.ownerId!=="seed"&&<button onClick={()=>unclaimListing(act)} title="Remove claim" style={{padding:"3px 8px",borderRadius:5,border:`1.5px solid #FDBA74`,background:"#FFF7ED",color:"#C2410C",fontSize:10.5,fontWeight:700,cursor:"pointer",fontFamily:F.body}}>Unclaim</button>}
                  <button onClick={()=>deleteListing(act.id)} style={{padding:"3px 7px",borderRadius:5,border:`1.5px solid #FECACA`,background:"#FEF2F2",color:"#DC2626",fontSize:10.5,fontWeight:700,cursor:"pointer",fontFamily:F.body}}>✕</button>
                </div>
              </div>
            ))}
          </div>
          {verifyTarget&&<AdminVerifyModal act={verifyTarget} onVerify={async(checks)=>{const u={...verifyTarget,verified:true,verificationChecks:checks,verifiedAt:new Date().toISOString()};await store.set(`activity:${verifyTarget.id}`,u);setActivities(p=>p.map(a=>a.id===verifyTarget.id?u:a));setVerifyTarget(null);}} onClose={()=>setVerifyTarget(null)}/>}
        </div>
      )}

      {/* ── USERS ── */}
      {tab==="users"&&(
        <div>
          <div style={{fontSize:12,color:C.slate400,marginBottom:12}}>{users.length} registered accounts</div>
          {users.length===0&&<p style={{color:C.slate400,fontSize:13}}>No users have signed up yet. Sign-ups are only available on the deployed version with Supabase.</p>}
          <div style={{display:"flex",flexDirection:"column",gap:5,maxHeight:"65vh",overflowY:"auto"}}>
            {users.map((u,i)=>{
              const ownedListings=activities.filter(a=>a.ownerId===u.id);
              return(
                <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderRadius:9,border:`1px solid ${C.slate200}`,background:"#fff"}}>
                  <div style={{width:32,height:32,borderRadius:"50%",background:C.brandLt,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:F.display,fontWeight:700,color:C.brand,fontSize:14,flexShrink:0}}>
                    {(u.name||u.email||"?")[0].toUpperCase()}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:600,fontSize:13,color:C.slate900}}>{u.name||"—"}{u.blocked&&<span style={{marginLeft:6,fontSize:10,fontWeight:700,color:"#B91C1C",background:"#FEE2E2",padding:"1px 6px",borderRadius:4}}>BLOCKED</span>}</div>
                    <div style={{fontSize:11.5,color:C.slate400}}>{u.email} · {u.accountType==="business"?"Business":"Individual"} · joined {fmtDate(u.createdAt)}</div>
                  </div>
                  <div style={{fontSize:11.5,color:C.slate500,flexShrink:0}}>{ownedListings.length} listing{ownedListings.length!==1?"s":""}</div>
                  <span style={{padding:"2px 8px",borderRadius:5,fontSize:10.5,fontWeight:700,background:u.accountType==="business"?C.brandLt:C.slate100,color:u.accountType==="business"?C.brand:C.slate500}}>
                    {u.accountType==="business"?"Org":"Family"}
                  </span>
                  {u.blocked?(
                    <button onClick={()=>unblockUser(u)} style={{padding:"3px 8px",borderRadius:5,border:"1.5px solid #0F6B5C",background:"#E4F0ED",color:"#0F6B5C",fontSize:10.5,fontWeight:700,cursor:"pointer",fontFamily:F.body}}>Unblock</button>
                  ):(
                    <button onClick={()=>blockUser(u)} style={{padding:"3px 8px",borderRadius:5,border:"1.5px solid #FDBA74",background:"#FFF7ED",color:"#C2410C",fontSize:10.5,fontWeight:700,cursor:"pointer",fontFamily:F.body}}>Block</button>
                  )}
                  <button onClick={()=>deleteUser(u.email)} style={{padding:"3px 7px",borderRadius:5,border:"1.5px solid #FECACA",background:"#FEF2F2",color:"#DC2626",fontSize:10.5,fontWeight:700,cursor:"pointer",fontFamily:F.body}}>✕</button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── REVENUE ── */}
      {tab==="revenue"&&(
        <div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:20}}>
            <div style={{background:"linear-gradient(135deg,#0A5044,#0F6B5C)",borderRadius:14,padding:"20px 22px",color:"white"}}>
              <div style={{fontSize:13,opacity:.75,marginBottom:6}}>Estimated MRR</div>
              <div style={{fontSize:40,fontWeight:700,fontFamily:F.display,lineHeight:1}}>£{estMRR.toLocaleString()}</div>
              <div style={{fontSize:12,opacity:.7,marginTop:4}}>before payment fees</div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              <div style={{background:"#FFFCF0",border:"1.5px solid #F6C96A",borderRadius:10,padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div><div style={{fontWeight:700,fontSize:14}}>⭐ Featured</div><div style={{fontSize:12,color:C.slate400}}>{featured.length} listings × £49/mo</div></div>
                <div style={{fontSize:20,fontWeight:700,fontFamily:F.display,color:"#D97706"}}>£{featured.length*49}</div>
              </div>
              <div style={{background:"#E4F0ED",border:"1.5px solid #0F6B5C",borderRadius:10,padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div><div style={{fontWeight:700,fontSize:14}}>✓ Verified</div><div style={{fontSize:12,color:C.slate400}}>{verified.length} listings × £15/mo</div></div>
                <div style={{fontSize:20,fontWeight:700,fontFamily:F.display,color:"#0F6B5C"}}>£{verified.length*15}</div>
              </div>
            </div>
          </div>
          <div style={{background:C.slate50,borderRadius:10,padding:"14px 16px",border:`1px solid ${C.slate200}`,marginBottom:12}}>
            <div style={{fontSize:13,fontWeight:600,color:C.slate700,marginBottom:8}}>Revenue targets</div>
            {[
              [10,490,150,"Early traction"],
              [25,1225,375,"Growing"],
              [50,2450,750,"Sustainable"],
              [100,4900,1500,"Scale"],
            ].map(([f,fr,vr,label])=>(
              <div key={label} style={{display:"flex",gap:10,alignItems:"center",marginBottom:6,fontSize:12.5}}>
                <span style={{color:C.slate400,width:90,flexShrink:0}}>{label}</span>
                <span style={{color:C.slate600}}>{f} featured + {Math.round(f*1.5)} verified</span>
                <span style={{marginLeft:"auto",fontWeight:700,color:C.brand}}>£{(fr+vr).toLocaleString()}/mo</span>
              </div>
            ))}
          </div>
          <div style={{fontSize:12,color:C.slate400,lineHeight:1.6}}>
            ⚠️ These are estimates only. Set up Stripe to track actual payments. Once Stripe is connected, replace these figures with real MRR. Revenue is split into two streams — Featured (promotion) and Verified (trust) — so even charities who can't afford Featured can pay £15/mo to show they're legit.
          </div>
        </div>
      )}

      {/* ── EXPORT ── */}
      {tab==="export"&&(
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <p style={{margin:"0 0 4px",color:C.slate500,fontSize:13.5}}>Download CSV files directly — no scripts needed.</p>
          {[
            {
              label:"All listings with emails",
              desc:`${hasEmail.length} listings that have a real email address`,
              icon:"📧",
              fn:()=>exportCSV(
                hasEmail.map(a=>({type:a.category||"activity",name:a.name,organisation:a.organisation,location:a.location,email:a.contactEmail,phone:a.contactPhone,website:a.website,tier:a.featured?"featured":a.verifiedPaid?"verified":"free"})),
                "includeme-listings-with-emails.csv"
              ),
            },
            {
              label:"Contact-form-only listings",
              desc:`${activities.length-hasEmail.length} listings needing manual contact`,
              icon:"🌐",
              fn:()=>exportCSV(
                activities.filter(a=>!a.contactEmail||a.contactEmail.includes("via website")).map(a=>({type:a.category||"activity",name:a.name,organisation:a.organisation,location:a.location,website:a.website||"–"})),
                "includeme-contact-form-only.csv"
              ),
            },
            {
              label:"Featured listings",
              desc:`${featured.length} current featured listings`,
              icon:"⭐",
              fn:()=>exportCSV(featured.map(a=>({name:a.name,organisation:a.organisation,location:a.location,email:a.contactEmail,website:a.website})),"includeme-featured.csv"),
            },
            {
              label:"Verified listings",
              desc:`${verified.length} verified (non-featured) listings`,
              icon:"✓",
              fn:()=>exportCSV(verified.map(a=>({name:a.name,organisation:a.organisation,location:a.location,email:a.contactEmail,website:a.website})),"includeme-verified.csv"),
            },
            {
              label:"Unclaimed listings",
              desc:`${activities.length-claimed.length} listings not yet claimed by their org`,
              icon:"🔓",
              fn:()=>exportCSV(
                activities.filter(a=>!a.ownerId||a.ownerId==="seed").map(a=>({type:a.category||"activity",name:a.name,organisation:a.organisation,location:a.location,email:a.contactEmail,website:a.website})),
                "includeme-unclaimed.csv"
              ),
            },
            {
              label:"Registered users",
              desc:`${users.length} signed-up accounts`,
              icon:"👤",
              fn:()=>users.length?exportCSV(users.map(u=>({name:u.name,email:u.email,type:u.accountType,joined:fmtDate(u.createdAt)})),"includeme-users.csv"):log("No users to export"),
            },
            {
              label:"Publish new listings to notifications",
              desc:`Send the ${activities.filter(a=>a.notifyOnPublish).length} flagged new listings to the alert feed`,
              icon:"📣",
              action:true,
              fn:async()=>{
                const flagged=activities.filter(a=>a.notifyOnPublish).map(a=>({id:a.id,name:a.name,location:a.location,type:a.type,category:a.category,lat:a.lat,lng:a.lng,description:a.description,cost:a.cost,ageMin:a.ageMin,ageMax:a.ageMax,needs:a.needs}));
                if(!flagged.length){log("No flagged listings to publish");return;}
                try{
                  const{data:{session}}=await sb.auth.getSession();
                  if(!session?.access_token){log("Sign in again to publish");return;}
                  const res=await fetch(`${API_BASE}/.netlify/functions/publish-new-listings`,{
                    method:"POST",
                    headers:{"Content-Type":"application/json",Authorization:`Bearer ${session.access_token}`},
                    body:JSON.stringify({mode:"admin",listings:flagged})
                  });
                  if(res.ok){
                    const b=await res.json();
                    // Clear the flag on published listings so it doesn't stay
                    // stuck "on" forever — lets admins flag new listings going
                    // forward without the count being cluttered by old ones.
                    await Promise.all(flagged.map(f=>toggleTier(f.id,"notifyOnPublish")));
                    log(`Published ${b.published} new listing(s) to the alert feed (${b.skipped} already published). Nearby subscribers will be notified on the next scheduled run.`);
                  }
                  else{const b=await res.json().catch(()=>({}));log("Publish failed: "+(b.error||res.status));}
                }catch(e){log("Publish failed — is the site deployed? "+(e?.message||""));}
              },
            },
          ].map(({label,desc,icon,fn,action})=>(
            <div key={label} style={{display:"flex",alignItems:"center",gap:12,padding:"14px 16px",borderRadius:10,border:`1px solid ${action?C.brand:C.slate200}`,background:action?C.brandLt:"#fff",cursor:"pointer"}} onClick={fn}>
              <span style={{fontSize:24,flexShrink:0}}>{icon}</span>
              <div style={{flex:1}}>
                <div style={{fontWeight:600,fontSize:13.5,color:C.slate900}}>{label}</div>
                <div style={{fontSize:12,color:C.slate400}}>{desc}</div>
              </div>
              <span style={{fontSize:13,fontWeight:700,color:C.brand,flexShrink:0}}>{action?"→ Publish":"↓ CSV"}</span>
            </div>
          ))}
        </div>
      )}
      {tab==="email"&&<AdminEmailTab activities={activities} users={users} requests={requests}/>}

      {/* ── FEED ── */}
      {tab==="feed"&&(
        <div>
          <h3 style={{margin:"0 0 4px",fontSize:15,fontWeight:600,color:C.slate800}}>Activity Feed</h3>
          <p style={{margin:"0 0 16px",fontSize:13,color:C.slate400}}>Recent platform activity — sign-ups, claims, suggestions and enquiries.</p>
          {(()=>{
            const fmtD=d=>{if(!d)return"";try{return new Date(d).toLocaleDateString("en-GB",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"});}catch{return d;}};
            const events=[
              ...users.map(u=>({ts:u.createdAt,icon:"👤",label:`New ${u.accountType==="business"?"provider":"family"} sign-up`,detail:`${u.name||u.email}${u.orgName?` · ${u.orgName}`:""}`,color:"#2563EB",bg:"#EFF6FF"})),
              ...(requests.claims||[]).map(r=>({ts:r.submittedAt||"",icon:"🔑",label:`Claim request`,detail:`${r.orgName||r.userId} → ${r.actName||r.actId}`,color:C.brand,bg:C.brandLt})),
              ...(requests.suggestions||[]).map(r=>({ts:r.at||"",icon:"💡",label:`Club suggested`,detail:`${r.name||"Unnamed"} · ${r.location||""}`,color:"#7C3AED",bg:"#F5F3FF"})),
              ...adminEnquiries.map(e=>({ts:e.sentAt,icon:"✉️",label:`Enquiry`,detail:`${e.fromName} → ${e.actName}`,color:"#D97706",bg:"#FFFBEB"})),
            ].sort((a,b)=>String(b.ts).localeCompare(String(a.ts))).slice(0,60);
            if(!events.length)return <p style={{color:C.slate400,fontSize:13}}>No activity recorded yet — it will build up as families and providers use the platform.</p>;
            return(
              <div style={{display:"flex",flexDirection:"column",gap:6,maxHeight:"65vh",overflowY:"auto"}}>
                {events.map((e,i)=>(
                  <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",padding:"9px 12px",borderRadius:9,background:e.bg,border:`1px solid ${e.color}22`}}>
                    <span style={{fontSize:16,flexShrink:0,marginTop:1}}>{e.icon}</span>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontWeight:600,fontSize:13,color:e.color}}>{e.label}</div>
                      <div style={{fontSize:12,color:C.slate600,marginTop:1}}>{e.detail}</div>
                    </div>
                    <span style={{fontSize:11,color:C.slate400,flexShrink:0,whiteSpace:"nowrap"}}>{fmtD(e.ts)}</span>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}

      {/* ── ENQUIRIES ── */}
      {tab==="enquiries"&&(
        <div>
          <h3 style={{margin:"0 0 4px",fontSize:15,fontWeight:600,color:C.slate800}}>All Enquiries</h3>
          <p style={{margin:"0 0 16px",fontSize:13,color:C.slate400}}>{adminEnquiries.length} enquiries sent to providers across the platform.</p>
          {adminEnquiries.length===0?(
            <div style={{textAlign:"center",padding:"32px 0",color:C.slate400}}>
              <div style={{fontSize:32,marginBottom:8}}>✉️</div>
              <p style={{fontSize:13}}>No enquiries yet — they'll appear here when families contact providers.</p>
            </div>
          ):(
            <div style={{display:"flex",flexDirection:"column",gap:8,maxHeight:"65vh",overflowY:"auto"}}>
              {adminEnquiries.map((e,i)=>(
                <div key={e.id||i} style={{background:e.read?"#fafafa":"#EFF6FF",border:`1px solid ${e.read?C.slate200:"#BFDBFE"}`,borderRadius:10,padding:"12px 14px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8,marginBottom:6}}>
                    <div style={{display:"flex",gap:8,alignItems:"center"}}>
                      <span style={{fontWeight:700,fontSize:13,color:C.slate900}}>{e.fromName}</span>
                      {!e.read&&<span style={{fontSize:10,fontWeight:800,color:"#2563EB",background:"#DBEAFE",padding:"1px 7px",borderRadius:99}}>NEW</span>}
                    </div>
                    <span style={{fontSize:11,color:C.slate400,flexShrink:0}}>{e.sentAt?new Date(e.sentAt).toLocaleDateString("en-GB",{day:"numeric",month:"short"}):""}</span>
                  </div>
                  <div style={{fontSize:12,color:C.slate500,marginBottom:6}}>Re: <strong>{e.actName}</strong></div>
                  <div style={{fontSize:13,color:C.slate700,lineHeight:1.5,marginBottom:6}}>{e.message}</div>
                  <div style={{display:"flex",gap:12,fontSize:12}}>
                    <a href={`mailto:${e.fromEmail}`} style={{color:C.brand,fontWeight:600,textDecoration:"none"}}>Reply to {e.fromEmail}</a>
                    {e.fromPhone&&<span style={{color:C.slate500}}>📞 {e.fromPhone}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── OUTREACH ── */}
      {tab==="outreach"&&<AdminOutreachTab activities={activities}/>}
      {tab==="updates"&&<AdminUpdatesTab/>}
    </Modal>
  );
};

// Our own adverts for the other IncludeMe tools: a slim strip near the top of the list, plus two cards among the listings.
// Families only, never providers. The strip can be dismissed for a week.
const PROMOS={
  ehcp:{title:"Going through an EHCP?",text:"Advocate keeps every deadline, report and phone call in one place. See what it does and how it works.",cta:"Find out more",chip:"Going through an EHCP?",chipCta:"Find out more",
    href:c=>`https://info.includeme.uk/advocate/?utm_campaign=${c}`,logo:"./promo/logo-advocate.svg",bg:"linear-gradient(160deg,#101A45 0%,#1F2C66 100%)",accent:"#E3B94E",accentInk:"#17214D",chipBg:"#ECEEF8",chipInk:"#17214D"},
  pp:{title:"All About Me, free",text:"One page about your child: medicines, doctors, how they communicate and who to call. Free, and it uses this same login.",cta:"Find out more",chip:"About your child",chipCta:"All About Me, free",
    href:c=>`https://info.includeme.uk/passport/?utm_campaign=${c}`,logo:"./promo/logo-passport.svg",bg:"linear-gradient(160deg,#2A1546 0%,#4E2D80 100%)",accent:"#FF8A5B",accentInk:"#1B1530",chipBg:"#F0EBF8",chipInk:"#3B1F63"},
};
const PromoCard=({kind})=>{
  const m=PROMOS[kind];
  return(
    <a href={m.href("finder_card_"+kind)} target="_blank" rel="noopener noreferrer" style={{display:"flex",flexDirection:"column",gap:10,justifyContent:"center",minHeight:210,padding:"22px 20px",borderRadius:16,background:m.bg,textDecoration:"none",boxShadow:"0 6px 20px rgba(23,33,77,0.18)"}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <img src={m.logo} alt="" width="36" height="36" style={{borderRadius:9}}/>
        <span style={{fontSize:11,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:"rgba(255,255,255,0.7)"}}>From IncludeMe</span>
      </div>
      <span style={{color:"#fff",fontWeight:700,fontSize:19,lineHeight:1.2,fontFamily:F.display}}>{m.title}</span>
      <span style={{color:"rgba(255,255,255,0.85)",fontSize:13.5,lineHeight:1.5}}>{m.text}</span>
      <span style={{alignSelf:"flex-start",marginTop:4,background:m.accent,color:m.accentInk,borderRadius:99,padding:"9px 18px",fontSize:13.5,fontWeight:700}}>{m.cta} →</span>
    </a>
  );
};
const PROMO_STRIP_KEY="im_promo_strip_until";
const PromoStrip=()=>{
  const [hidden,setHidden]=useState(()=>{try{return Number(localStorage.getItem(PROMO_STRIP_KEY)||0)>Date.now();}catch{return false;}});
  if(hidden)return null;
  const close=()=>{try{localStorage.setItem(PROMO_STRIP_KEY,String(Date.now()+7*864e5));}catch{}setHidden(true);};
  return(
    <div style={{display:"flex",alignItems:"stretch",gap:8,margin:"0 0 14px"}}>
      <div style={{flex:1,display:"flex",gap:8,flexWrap:"wrap"}}>
        {["ehcp","pp"].map(k=>{const m=PROMOS[k];return(
          <a key={k} href={m.href("finder_strip_"+k)} target="_blank" rel="noopener noreferrer" style={{flex:"1 1 150px",display:"flex",alignItems:"center",gap:8,padding:"8px 10px",borderRadius:12,background:m.chipBg,textDecoration:"none",border:"1px solid rgba(0,0,0,0.06)"}}>
            <img src={m.logo} alt="" width="28" height="28" style={{borderRadius:8,flexShrink:0}}/>
            <span style={{display:"flex",flexDirection:"column",minWidth:0}}>
              <span style={{fontSize:13,fontWeight:700,color:m.chipInk,lineHeight:1.25}}>{m.chip}</span>
              <span style={{fontSize:12.5,fontWeight:600,color:m.chipInk,opacity:0.8}}>{m.chipCta} ↗</span>
            </span>
          </a>);})}
      </div>
      <button onClick={close} aria-label="Hide these for a week" title="Hide for a week" style={{flexShrink:0,width:30,alignSelf:"flex-start",background:"none",border:"none",color:C.slate400,fontSize:20,lineHeight:1,cursor:"pointer",padding:"4px 0"}}>×</button>
    </div>
  );
};

// Two buttons under the header bar for our separate products. Tapping one drops a drawer down with more information and a link.
// Only one drawer is open at a time. Families only.
const APPS_KEY="im_apps_seen";
const APP_ROWS=[
  {id:"ehcp",name:"Advocate",tag:"EHCP",tagBg:"#E3B94E",tagInk:"#17214D",desc:"Organise an EHCP: every deadline, report, phone call and letter in one place. £3.99 a month after a 3-day free trial, cancel any time.",cta:"Find out more",href:"https://info.includeme.uk/advocate/?utm_campaign=finder_apps_ehcp",logo:"./promo/logo-advocate.svg"},
  {id:"pp",name:"All About Me",tag:"FREE",tagBg:"#FF8A5B",tagInk:"#1B1530",desc:"A one-page profile for your child: medicines, doctors, how they communicate and who to call. Free, and it uses this same login.",cta:"Find out more",href:"https://info.includeme.uk/passport/?utm_campaign=finder_apps_pp",logo:"./promo/logo-passport.svg"},
];
const AppsDrawer=()=>{
  const [open,setOpen]=useState(null);
  const ref=useRef(null);
  useEffect(()=>{
    if(!open)return;
    const away=e=>{if(ref.current&&!ref.current.contains(e.target))setOpen(null);};
    const esc=e=>{if(e.key==="Escape")setOpen(null);};
    document.addEventListener("mousedown",away);document.addEventListener("touchstart",away);document.addEventListener("keydown",esc);
    return()=>{document.removeEventListener("mousedown",away);document.removeEventListener("touchstart",away);document.removeEventListener("keydown",esc);};
  },[open]);
  const cur=APP_ROWS.find(r=>r.id===open);
  return(
    <div ref={ref} className="apps-strip" style={{background:"rgba(0,0,0,0.14)"}}>
      <div style={{maxWidth:1080,margin:"0 auto",padding:"7px 16px",display:"flex",gap:8,alignItems:"center"}}>
        <span className="apps-strip-lbl" style={{fontSize:10.5,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:"rgba(255,255,255,0.6)",flexShrink:0}}>More from IncludeMe</span>
        {APP_ROWS.map(r=>(
          <button key={r.id} type="button" onClick={()=>setOpen(o=>o===r.id?null:r.id)} aria-expanded={open===r.id} aria-controls="apps-drawer"
            style={{flex:"1 1 0",minWidth:0,display:"flex",alignItems:"center",gap:7,padding:"6px 9px",borderRadius:10,border:`1px solid ${open===r.id?"#fff":"rgba(255,255,255,0.25)"}`,background:open===r.id?"rgba(255,255,255,0.2)":"rgba(255,255,255,0.08)",color:"#fff",fontFamily:F.body,fontWeight:700,fontSize:12.5,cursor:"pointer",textAlign:"left"}}>
            <img src={r.logo} alt="" width="22" height="22" style={{borderRadius:6,flexShrink:0}}/>
            <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1}}>{r.name}</span>
            <span aria-hidden="true" style={{fontSize:10,transform:open===r.id?"rotate(180deg)":"none",transition:"transform .15s",flexShrink:0}}>▼</span>
          </button>
        ))}
      </div>
      {cur&&(
        <div id="apps-drawer" role="region" aria-label={cur.name} className="apps-drawer" style={{background:"#fff",borderBottom:"1px solid rgba(0,0,0,0.08)",boxShadow:"0 14px 30px rgba(20,24,40,0.22)"}}>
          <div style={{maxWidth:1080,margin:"0 auto",padding:"14px 16px 16px",display:"flex",gap:12,alignItems:"flex-start"}}>
            <img src={cur.logo} alt="" width="44" height="44" style={{borderRadius:12,flexShrink:0}}/>
            <div style={{minWidth:0,flex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}><span style={{fontSize:15,fontWeight:700,color:C.slate900}}>{cur.name}</span><span style={{fontSize:10,fontWeight:800,letterSpacing:"0.06em",padding:"2px 7px",borderRadius:99,background:cur.tagBg,color:cur.tagInk}}>{cur.tag}</span></div>
              <div style={{fontSize:13.5,color:C.slate500,lineHeight:1.5,marginBottom:10}}>{cur.desc}</div>
              <a href={cur.href} target="_blank" rel="noopener noreferrer" onClick={()=>setOpen(null)} style={{display:"inline-block",background:C.brand,color:"#fff",borderRadius:99,padding:"9px 18px",fontSize:13.5,fontWeight:700,textDecoration:"none"}}>{cur.cta} ↗</a>
              <div style={{fontSize:11.5,color:C.slate400,marginTop:8}}>A separate app from the Finder. Opens in a new tab.</div>
            </div>
            <button type="button" onClick={()=>setOpen(null)} aria-label="Close" style={{background:"none",border:"none",fontSize:22,lineHeight:1,color:C.slate400,cursor:"pointer",padding:"2px 4px",flexShrink:0}}>×</button>
          </div>
        </div>
      )}
    </div>
  );
};

// One menu at the top right for everything personal: alerts, saved places, account (and the admin panel for admins).
const HeaderMenu=({alerts,saved,name,onAlerts,onSaved,onAccount,onAdmin,isAdmin})=>{
  const [open,setOpen]=useState(false);
  const ref=useRef(null);
  useEffect(()=>{
    if(!open)return;
    const away=e=>{if(ref.current&&!ref.current.contains(e.target))setOpen(false);};
    const esc=e=>{if(e.key==="Escape")setOpen(false);};
    document.addEventListener("mousedown",away);document.addEventListener("touchstart",away);document.addEventListener("keydown",esc);
    return()=>{document.removeEventListener("mousedown",away);document.removeEventListener("touchstart",away);document.removeEventListener("keydown",esc);};
  },[open]);
  const go=fn=>()=>{setOpen(false);fn();};
  const item=(icon,label,count,fn,hot)=>(
    <button type="button" role="menuitem" onClick={go(fn)} style={{display:"flex",alignItems:"center",gap:12,width:"100%",padding:"13px 12px",borderRadius:10,border:"none",background:"none",cursor:"pointer",fontFamily:F.body,fontSize:15,fontWeight:600,color:C.slate900,textAlign:"left",minHeight:48}}>
      <span style={{width:24,textAlign:"center",fontSize:17,lineHeight:1}} aria-hidden="true">{icon}</span>
      <span style={{flex:1}}>{label}</span>
      {count>0&&<span style={{minWidth:20,height:20,padding:"0 6px",borderRadius:99,background:hot?C.accent:C.slate400,color:"#fff",fontSize:11,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center"}}>{count>9?"9+":count}</span>}
    </button>
  );
  return(
    <div ref={ref} style={{position:"relative",flexShrink:0}}>
      <button type="button" className="hdr-ic" onClick={()=>setOpen(o=>!o)} aria-expanded={open} aria-haspopup="menu" aria-label={"Menu"+(alerts>0?", "+alerts+" new":"")}
        style={{position:"relative",width:38,height:38,borderRadius:10,border:"1px solid rgba(255,255,255,0.3)",background:"rgba(255,255,255,0.12)",color:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M3 5h14M3 10h14M3 15h14"/></svg>
        {alerts>0&&<span className="hdr-badge" style={{position:"absolute",top:-4,right:-4,minWidth:16,height:16,padding:"0 4px",borderRadius:99,background:C.accent,color:"#fff",fontSize:10,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 0 0 2px #0F6B5C"}}>{alerts>9?"9+":alerts}</span>}
      </button>
      {open&&(
        <div role="menu" aria-label="Menu" style={{position:"absolute",right:0,top:"calc(100% + 10px)",width:"min(280px, 92vw)",background:"#fff",borderRadius:16,boxShadow:"0 18px 50px rgba(20,24,40,0.35)",padding:8,zIndex:200}}>
          {item("🔔","Alerts, messages and planner",alerts,onAlerts,true)}
          {item("♥","Saved",saved,onSaved,false)}
          {item("👤",name||"My account",0,onAccount)}
          {isAdmin&&item("⚙️","Admin panel",0,onAdmin)}
        </div>
      )}
    </div>
  );
};

// Gentle pointers to the other free IncludeMe tools. Shown once, inside the account menu, never as a pop-up.
const MoreFromIncludeMe=()=>{
  const items=[
    ["Going through an EHCP?","Advocate keeps deadlines, reports, calls and letters in one place.","https://info.includeme.uk/advocate/?utm_campaign=finder_menu","Find out about Advocate"],
    ["Free EHCP deadline calculator","Enter the date the council got your request and see your 6, 16 and 20 week dates.","https://info.includeme.uk/ehcp-deadline-calculator/?utm_campaign=finder_menu","Open the calculator"],
    ["All About Me, free","A one-page profile for your child with medicines, doctors and emergency contacts. Sign in with this same email and password.","https://info.includeme.uk/passport/?utm_campaign=finder_menu","Find out about All About Me"],
  ];
  return(
    <div style={{marginTop:18,paddingTop:16,borderTop:`1px solid ${C.slate100}`}}>
      <div style={{fontSize:11,fontWeight:600,color:C.slate400,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:10}}>More from IncludeMe</div>
      {items.map(([t,d,href,cta])=>(
        <a key={t} href={href} target="_blank" rel="noopener noreferrer" style={{display:"block",textDecoration:"none",background:C.slate50,border:`1px solid ${C.slate100}`,borderRadius:10,padding:"11px 13px",marginBottom:8}}>
          <div style={{fontSize:13.5,fontWeight:600,color:C.slate800}}>{t}</div>
          <div style={{fontSize:12.5,color:C.slate500,lineHeight:1.45,margin:"2px 0 5px"}}>{d}</div>
          <div style={{fontSize:12.5,fontWeight:600,color:C.brand}}>{cta} ↗</div>
        </a>
      ))}
    </div>
  );
};

const AccountModal=({user,onClose,onUpdateUser,onLogout,currentFilters,onLoadPreset,myListings=[],onEditListing,onDeleteListing,onActivateListing,onActivateVerifiedListing,activities=[],userLoc,initialTab,upgradeConfirmation,initialShowEnquiries})=>{
  const [tab,setTab]=useState(initialTab||(user.accountType==="business"&&myListings.length?"listings":"profile"));
  const [flash,setFlash]=useState("");
  const [name,setName]=useState(user.name);
  const [orgName,setOrgName]=useState(user.orgName||"");
  const [saving,setSaving]=useState(false);
  const [presets,setPresets]=useState(user.filterPresets||[]);
  const [presetName,setPresetName]=useState("");
  const [notifs,setNotifs]=useState(user.notifications||{newActivities:true,nearMe:false,weeklySummary:false});
  // NOTE: there is a separate, correct module-level saveProfile(patch) function
  // (defined near ensureProfile) that properly merges & writes to Supabase.
  // persist() below calls that outer function directly with the FULL updated
  // user object as the patch — do NOT redeclare a local `saveProfile` in this
  // component again, since that previously shadowed the outer one and caused
  // every write in this modal (Turn off notifications, presets, etc.) to
  // silently save stale data instead of the real change.
  const persist=async u=>{onUpdateUser(u);try{await saveProfile(u);}catch{}};
  const showFlash=msg=>{setFlash(msg);setTimeout(()=>setFlash(""),2500);};
  const handleSaveProfileClick=async()=>{setSaving(true);await persist({...user,name,orgName});setSaving(false);showFlash("Changes saved");};
  const savePreset=async()=>{if(!presetName.trim())return;const p={id:`p-${Date.now()}`,name:presetName.trim(),filters:{...currentFilters}};const u=[...presets,p];setPresets(u);await persist({...user,filterPresets:u});setPresetName("");showFlash("Preset saved");};
  const removePreset=async id=>{const u=presets.filter(p=>p.id!==id);setPresets(u);await persist({...user,filterPresets:u});};
  const saveNotifs=async()=>{await persist({...user,notifications:notifs});showFlash("Preferences saved");};
  const filterSummary=f=>{const p=[];if(f.location)p.push(f.location);if(f.type&&f.type!=="All Types")p.push(f.type);if(f.needs?.length)p.push(`${f.needs.length} needs`);if(f.age)p.push(`Age ${f.age}`);if(f.distRadius&&f.locLabel)p.push(`${f.distRadius} mi from ${f.locLabel}`);return p.length?p.join(" · "):"No filters set";};
  const tabs=[{id:"profile",label:"Profile",icon:"👤"},...(myListings.length?[{id:"listings",label:"My Listings",icon:"📋"}]:[]),...(user.accountType==="individual"?[{id:"planner",label:"Planner",icon:"🗓️"}]:[]),{id:"presets",label:"Saved Filters",icon:"🔖"},{id:"notifications",label:"Notifications",icon:"🔔"}];
  return(
    <Modal onClose={onClose} maxWidth={640} noPad>
      {/* Header */}
      <div style={{background:`linear-gradient(135deg,#0A5044,#0F6B5C)`,padding:"24px 28px",borderRadius:"16px 16px 0 0",position:"relative"}}>
        <button onClick={onClose} style={{position:"absolute",top:14,right:14,background:"rgba(255,255,255,0.15)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:8,width:32,height:32,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"white"}}><Icons.x/></button>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          <div style={{background:"rgba(255,255,255,0.18)",border:"2px solid rgba(255,255,255,0.35)",borderRadius:"50%",width:52,height:52,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:700,color:"white",fontFamily:F.display,flexShrink:0}}>
            {(user.name&&!user.name.includes("@")?user.name:user.email)[0].toUpperCase()}
          </div>
          <div style={{minWidth:0}}>
            <div style={{fontSize:17,fontWeight:700,color:"white",fontFamily:F.display,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
              {user.name&&!user.name.includes("@")?user.name:"Your Account"}
            </div>
            <div style={{fontSize:12,color:"rgba(255,255,255,0.65)",marginTop:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
              {user.email} · {user.accountType==="business"?"Organisation":"Individual"}
            </div>
          </div>
        </div>
      </div>
      {/* Tabs */}
      <div style={{display:"flex",borderBottom:`1px solid ${C.slate100}`,background:C.white,overflowX:"auto"}}>
        {tabs.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,minWidth:88,padding:"13px 8px",border:"none",borderBottom:tab===t.id?`2px solid ${C.brand}`:"2px solid transparent",background:C.white,cursor:"pointer",fontSize:12,fontWeight:600,color:tab===t.id?C.brand:C.slate400,display:"flex",flexDirection:"column",alignItems:"center",gap:4,transition:"color 0.15s",marginBottom:-1}}><span>{t.icon}</span>{t.label}</button>)}
      </div>
      {/* Content */}
      <div style={{padding:28,overflowY:"auto"}}>
        {flash&&<div style={{background:"#F0FDF4",border:`1px solid #BBF7D0`,color:C.green,padding:"10px 14px",borderRadius:8,fontSize:13,fontWeight:600,marginBottom:20}}>✓ {flash}</div>}
        {tab==="profile"&&<>
          {user.accountType==="individual"&&<ShareCard/>}
          <Input label="Display Name" value={name} onChange={e=>setName(e.target.value)}/>
          {user.accountType==="business"&&<Input label="Organisation Name" value={orgName} onChange={e=>setOrgName(e.target.value)}/>}
          <div style={{background:C.slate50,borderRadius:8,padding:12,marginBottom:20,border:`1px solid ${C.slate100}`}}>
            <div style={{fontSize:11,fontWeight:600,color:C.slate400,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:2}}>Email</div>
            <div style={{fontSize:13,color:C.slate600}}>{user.email}</div>
          </div>
          <Btn onClick={handleSaveProfileClick} loading={saving}>Save Changes</Btn>
          {user.accountType==="individual"&&<MoreFromIncludeMe/>}
          <div style={{marginTop:12,paddingTop:16,borderTop:`1px solid ${C.slate100}`}}>
            <button onClick={onLogout} style={{display:"flex",alignItems:"center",gap:7,color:C.slate400,background:"none",border:"none",fontSize:13,fontWeight:500,cursor:"pointer",fontFamily:F.body,padding:0}}>
              <Icons.logout/> Sign out
            </button>
          </div>
        </>}

        {tab==="presets"&&<>
          <h3 style={{margin:"0 0 4px",fontSize:15,fontWeight:600,color:C.slate800}}>Saved Filter Presets</h3>
          <p style={{margin:"0 0 20px",fontSize:13,color:C.slate400}}>Save your current search filters as a named preset.</p>
          <div style={{background:C.slate50,borderRadius:10,padding:18,marginBottom:24,border:`1px solid ${C.slate200}`}}>
            <div style={{fontSize:12,fontWeight:600,color:C.slate600,marginBottom:6}}>Current filters</div>
            <div style={{fontSize:13,color:C.slate500,marginBottom:14,padding:"8px 12px",background:C.white,borderRadius:7,border:`1px solid ${C.slate100}`}}>{filterSummary(currentFilters)}</div>
            <div style={{display:"flex",gap:8,alignItems:"flex-end"}}>
              <div style={{flex:1}}><Input label="Preset Name" value={presetName} onChange={e=>setPresetName(e.target.value)} placeholder='e.g. Weekends near Leeds'/></div>
              <div style={{marginBottom:18}}><Btn onClick={savePreset} disabled={!presetName.trim()}><Icons.save/>Save</Btn></div>
            </div>
          </div>
          {presets.length===0?<div style={{textAlign:"center",padding:"32px",background:C.slate50,borderRadius:10}}><div style={{fontSize:32,marginBottom:8}}>🔖</div><p style={{color:C.slate400,fontSize:13}}>No saved presets yet.</p></div>
          :presets.map(p=>(
            <div key={p.id} style={{background:C.slate50,borderRadius:10,padding:14,marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12,border:`1px solid ${C.slate100}`}}>
              <div><div style={{fontWeight:600,color:C.slate800,fontSize:14,marginBottom:2}}>🔖 {p.name}</div><div style={{fontSize:12,color:C.slate400}}>{filterSummary(p.filters)}</div></div>
              <div style={{display:"flex",gap:6,flexShrink:0}}><Btn size="sm" variant="secondary" onClick={()=>{onLoadPreset(p.filters);onClose();}}>Load</Btn><Btn size="sm" variant="danger" onClick={()=>removePreset(p.id)}><Icons.trash/></Btn></div>
            </div>
          ))}
        </>}
        {tab==="planner"&&(
          <HolidayPlannerModal user={user} activities={activities} userLoc={userLoc} inline/>
        )}
        {tab==="notifications"&&(
          <div>
          <h3 style={{margin:"0 0 4px",fontSize:15,fontWeight:600,color:C.slate800}}>Push Notifications</h3>
          <p style={{margin:"0 0 18px",fontSize:13,color:C.slate400,lineHeight:1.5}}>Get notified the moment new activities, holiday clubs and events appear near you — no need to keep checking back.</p>
          {user.notifSub?(
            <div style={{background:C.brandLt,border:`1px solid rgba(15,107,92,0.2)`,borderRadius:12,padding:"14px 16px",marginBottom:20,display:"flex",alignItems:"center",gap:12}}>
              <span style={{fontSize:22}}>🔔</span>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,color:C.brand,fontSize:14}}>Notifications are on</div>
                <div style={{fontSize:12,color:C.slate500,marginTop:2}}>Within {user.notifSub.radius||20} miles{user.notifSub.locLabel?` of ${user.notifSub.locLabel}`:""}</div>
              </div>
              <button onClick={async()=>{const u={...user,notifSub:null};await persist(u);try{await store.del(`notif_sub:${user.id}`);}catch{}}} style={{fontSize:12,color:C.slate400,background:"none",border:"none",cursor:"pointer",fontFamily:F.body,fontWeight:600}}>Turn off</button>
            </div>
          ):(
            <div style={{background:C.slate50,border:`1px solid ${C.slate200}`,borderRadius:12,padding:"16px",marginBottom:20,textAlign:"center"}}>
              <div style={{fontSize:28,marginBottom:8}}>🔕</div>
              <p style={{color:C.slate500,fontSize:13,margin:"0 0 14px",lineHeight:1.5}}>Notifications are off. Enable them to hear about new activities and events near you.</p>
              <button onClick={()=>{onClose();setTimeout(()=>document.dispatchEvent(new CustomEvent("includeme:showPushModal")),100);}} style={{padding:"10px 20px",borderRadius:10,border:"none",background:C.brand,color:"white",fontWeight:700,fontSize:13.5,cursor:"pointer",fontFamily:F.body}}>🔔 Enable notifications</button>
            </div>
          )}
          {/* Weekly email digest */}
          <div style={{borderTop:`1px solid ${C.slate100}`,paddingTop:18,marginTop:16}}>
            <div style={{fontSize:12,fontWeight:700,color:C.slate500,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:12}}>Weekly email digest</div>
            {user.emailSub?(
              <div style={{background:C.brandLt,border:`1px solid rgba(15,107,92,0.2)`,borderRadius:10,padding:"12px 14px",display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:18}}>✉️</span>
                <div style={{flex:1}}>
                  <div style={{fontWeight:600,color:C.brand,fontSize:13}}>Weekly digest on</div>
                  <div style={{fontSize:12,color:C.slate500,marginTop:1}}>Sent every {user.emailSub.day||"Monday"} to {user.emailSub.email}</div>
                </div>
                <button onClick={async()=>{const u={...user,emailSub:null};await persist(u);try{await store.del(`email_sub:${user.id}`);}catch{}}} style={{fontSize:12,color:C.slate400,background:"none",border:"none",cursor:"pointer",fontFamily:F.body,fontWeight:600}}>Turn off</button>
              </div>
            ):(
              <WeeklyEmailForm user={user} onSave={async(sub)=>{const u={...user,emailSub:sub};persist(u);try{await store.set(`email_sub:${user.id}`,sub);}catch{}}}/>
            )}
          </div>
          {/* In-app alert toggles */}
          <div style={{borderTop:`1px solid ${C.slate100}`,paddingTop:18,marginTop:16}}>
            <div style={{fontSize:12,fontWeight:700,color:C.slate500,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:12}}>In-app alerts</div>
            {[{key:"newActivities",emoji:"🆕",title:"New Activities",desc:"When new activities are added near you"},{key:"nearMe",emoji:"📍",title:"Near Me",desc:"New listings in your saved area"},{key:"weeklySummary",emoji:"📋",title:"Weekly Summary",desc:"A weekly roundup of activities near you"}].map(({key,emoji,title,desc})=>(
              <div key={key} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:`1px solid ${C.slate100}`}}>
                <div style={{flex:1,marginRight:16}}><div style={{fontWeight:600,color:C.slate800,fontSize:13.5}}>{emoji} {title}</div><div style={{fontSize:12,color:C.slate400,marginTop:2}}>{desc}</div></div>
                <button onClick={()=>setNotifs(n=>({...n,[key]:!n[key]}))} style={{width:44,height:24,borderRadius:12,border:"none",cursor:"pointer",background:notifs[key]?C.brand:C.slate200,position:"relative",transition:"background 0.2s",flexShrink:0}}>
                  <div style={{position:"absolute",top:2,left:notifs[key]?22:2,width:20,height:20,background:"white",borderRadius:"50%",transition:"left 0.2s",boxShadow:SHADOW.sm}}/>
                </button>
              </div>
            ))}
            <div style={{marginTop:16}}><Btn onClick={saveNotifs}>Save</Btn></div>
          </div>
          </div>
        )}
        {tab==="listings"&&<ListingsPanel listings={myListings} user={user} onEdit={onEditListing} onDelete={onDeleteListing} onActivate={onActivateListing} onActivateVerified={onActivateVerifiedListing} upgradeConfirmation={upgradeConfirmation} initialShowEnquiries={initialShowEnquiries}/>}
      </div>
    </Modal>
  );
};

// ─── Landing Auth Card ────────────────────────────────────────────────────────
const LandingAuthCard=({onAuth})=>{
  const [mode,setMode]=useState("login");
  const [accountType,setAccountType]=useState("individual");
  const [form,setForm]=useState({name:"",email:"",password:"",orgName:""});
  const [showPw,setShowPw]=useState(false);
  const [err,setErr]=useState("");
  const [loading,setLoading]=useState(false);
  const [privacyAccepted,setPrivacyAccepted]=useState(false);
  const [showPrivacy,setShowPrivacy]=useState(false);
  const [showTerms,setShowTerms]=useState(false);
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const submit=async()=>{
    setErr("");setLoading(true);
    try{
      if(mode==="signup"){
        if(!form.name||!form.email||!form.password){setErr("Please fill in all required fields.");setLoading(false);return;}
        if(form.password.length<6){setErr("Password must be at least 6 characters.");setLoading(false);return;}
        if(!privacyAccepted){setErr("Please accept the Privacy Policy and Terms of Service to continue.");setLoading(false);return;}
        const {data}=await auth.signUp({email:form.email,password:form.password,name:form.name,accountType,orgName:accountType==="business"?form.orgName:undefined});
        if(data.session){const u=await ensureProfileSafe(data.user);onAuth(u);}else{setErr("Account created! Check your email to confirm your address, then sign in.");setMode("login");}
      }else{
        if(!form.email||!form.password){setErr("Please enter your email and password.");setLoading(false);return;}
        const {data}=await auth.signIn({email:form.email,password:form.password});
        const u=await ensureProfileSafe(data.user);onAuth(u);
      }
    }catch(e){setErr(e?.message||"Something went wrong. Please try again.");}
    setLoading(false);
  };
  return(
    <div style={{background:C.white,borderRadius:16,padding:"28px 32px",maxWidth:420,width:"100%",margin:"0 16px",border:`1px solid ${C.slate200}`,boxShadow:SHADOW.xl,position:"relative",zIndex:1}}>
      {showPrivacy&&<PrivacyPolicyModal onClose={()=>setShowPrivacy(false)}/>}
      {showTerms&&<TermsModal onClose={()=>setShowTerms(false)}/>}
      <div style={{display:"flex",background:C.slate100,borderRadius:10,padding:3,marginBottom:24}}>
        {[["login","Sign In"],["signup","Create Account"]].map(([m,lbl])=>(
          <button key={m} onClick={()=>{setMode(m);setErr("");}} style={{flex:1,padding:"9px 0",borderRadius:8,border:"none",background:mode===m?C.white:"transparent",color:mode===m?C.brand:C.slate500,fontWeight:600,fontSize:13,cursor:"pointer",transition:"all 0.2s",letterSpacing:"0.01em",boxShadow:mode===m?SHADOW.sm:"none"}}>
            {lbl}
          </button>
        ))}
      </div>
      {mode==="signup"&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20}}>
          {[["individual","👤","Carer / Parent"],["business","🏢","Organisation"]].map(([val,emoji,lbl])=>(
            <button key={val} onClick={()=>setAccountType(val)} style={{padding:"14px 8px",borderRadius:10,border:`1.5px solid ${accountType===val?C.brand:C.slate200}`,background:accountType===val?C.brandLt:C.white,cursor:"pointer",textAlign:"center",transition:"all 0.15s"}}>
              <div style={{fontSize:22,marginBottom:4}}>{emoji}</div>
              <div style={{fontSize:12,fontWeight:600,color:accountType===val?C.brand:C.slate500}}>{lbl}</div>
            </button>
          ))}
        </div>
      )}
      {mode==="signup"&&<div style={{marginBottom:12}}><input style={{...inputStyle}} placeholder="Full name" value={form.name} onChange={e=>set("name",e.target.value)}/></div>}
      {mode==="signup"&&accountType==="business"&&<div style={{marginBottom:12}}><input style={{...inputStyle}} placeholder="Organisation name" value={form.orgName} onChange={e=>set("orgName",e.target.value)}/></div>}
      <div style={{marginBottom:12}}><input style={{...inputStyle}} type="email" placeholder="Email address" value={form.email} onChange={e=>set("email",e.target.value)}/></div>
      {mode==="login"&&<div style={{textAlign:"right",marginTop:-4,marginBottom:12}}><button onClick={()=>doReset(form.email,setErr)} style={{background:"none",border:"none",color:C.brand,fontWeight:600,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Forgot password?</button></div>}
      <div style={{marginBottom:mode==="signup"?12:20,position:"relative"}}>
        <input style={{...inputStyle,paddingRight:44}} type={showPw?"text":"password"} placeholder="Password" value={form.password} onChange={e=>set("password",e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()}/>
        <button onClick={()=>setShowPw(v=>!v)} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:C.slate400,padding:0,lineHeight:0}}>{showPw?<Icons.eyeOff/>:<Icons.eye/>}</button>
      </div>
      {mode==="signup"&&(
        <label style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:16,cursor:"pointer"}}>
          <input type="checkbox" checked={privacyAccepted} onChange={e=>setPrivacyAccepted(e.target.checked)} style={{marginTop:3,width:15,height:15,flexShrink:0,accentColor:C.brand}}/>
          <span style={{fontSize:12.5,color:C.slate500,lineHeight:1.5}}>I have read and agree to the <button onClick={e=>{e.preventDefault();setShowPrivacy(true);}} style={{background:"none",border:"none",color:C.brand,fontWeight:600,cursor:"pointer",fontSize:12.5,padding:0,textDecoration:"underline"}}>Privacy Policy</button> and <button onClick={e=>{e.preventDefault();setShowTerms(true);}} style={{background:"none",border:"none",color:C.brand,fontWeight:600,cursor:"pointer",fontSize:12.5,padding:0,textDecoration:"underline"}}>Terms of Service</button></span>
        </label>
      )}
      {err&&<div style={{background:"#FEF2F2",border:"1px solid #FECACA",color:C.red,padding:"10px 14px",borderRadius:8,fontSize:13,fontWeight:500,marginBottom:16}}>{err}</div>}
      <button onClick={submit} disabled={loading} style={{width:"100%",padding:"12px 0",background:C.brand,color:"white",border:"none",borderRadius:10,fontSize:14,fontWeight:700,cursor:"pointer",letterSpacing:"0.01em",boxShadow:SHADOW.brand,transition:"opacity 0.15s",opacity:loading?0.7:1,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
        {loading?<div style={{width:14,height:14,border:"2px solid rgba(255,255,255,0.4)",borderTopColor:"white",borderRadius:"50%",animation:"spin 0.7s linear infinite"}}/>:<>{mode==="login"?"Sign In →":"Create Account →"}</>}
      </button>
      <p style={{textAlign:"center",fontSize:12,color:C.slate400,marginTop:16,marginBottom:0}}>
        {mode==="login"?"New to IncludeMe? ":"Already registered? "}
        <button onClick={()=>{setMode(mode==="login"?"signup":"login");setErr("");}} style={{background:"none",border:"none",color:C.brand,fontWeight:600,cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>
          {mode==="login"?"Create a free account":"Sign in instead"}
        </button>
      </p>
    </div>
  );
};

// ─── Notifications inbox (in-app feed of holiday clubs & availability near you) ─
const NotificationsModal=({items,onOpen,onClose,onClear,onClearOne,unreadMessages=0,onMessages,onPlanner})=>{
  return(
    <Modal onClose={onClose} maxWidth={520}>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12,marginBottom:4,paddingRight:32}}>
        <h2 style={{margin:0,fontSize:20,fontWeight:700,color:C.slate900,fontFamily:F.display}}>Notifications</h2>
        {items.length>0&&<button onClick={onClear} style={{flexShrink:0,background:"none",border:"none",color:C.brand,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:F.body,padding:"2px 0"}}>Clear all</button>}
      </div>
      <div style={{display:"flex",gap:8,margin:"4px 0 16px",flexWrap:"wrap"}}>
        {onMessages&&<button onClick={onMessages} style={{flex:"1 1 150px",display:"flex",alignItems:"center",gap:10,padding:"11px 13px",borderRadius:10,border:`1px solid ${C.slate100}`,background:C.slate50,cursor:"pointer",fontFamily:F.body,textAlign:"left"}}>
          <span style={{fontSize:18}}>💬</span>
          <span style={{display:"flex",flexDirection:"column"}}><span style={{fontSize:13.5,fontWeight:700,color:C.slate900}}>Messages</span><span style={{fontSize:12,color:unreadMessages>0?"#2563EB":C.slate500,fontWeight:unreadMessages>0?700:500}}>{unreadMessages>0?`${unreadMessages} new`:"Replies from providers"}</span></span>
        </button>}
        {onPlanner&&<button onClick={onPlanner} style={{flex:"1 1 150px",display:"flex",alignItems:"center",gap:10,padding:"11px 13px",borderRadius:10,border:`1px solid ${C.slate100}`,background:C.slate50,cursor:"pointer",fontFamily:F.body,textAlign:"left"}}>
          <span style={{fontSize:18}}>🗓️</span>
          <span style={{display:"flex",flexDirection:"column"}}><span style={{fontSize:13.5,fontWeight:700,color:C.slate900}}>Holiday planner</span><span style={{fontSize:12,color:C.slate500}}>Plan your school holidays</span></span>
        </button>}
      </div>
      <p style={{margin:"0 0 18px",fontSize:13,color:C.slate400}}>New holiday clubs and availability near you</p>
      {items.length===0?(
        <div style={{textAlign:"center",padding:"40px 0",color:C.slate400}}>
          <div style={{fontSize:36,marginBottom:10}}>🔔</div>
          <p style={{fontSize:14,fontWeight:500,margin:"0 0 4px",color:C.slate500}}>You're all caught up</p>
          <p style={{fontSize:13}}>Set your location and save activities to get holiday-club and availability alerts here.</p>
        </div>
      ):(
        <div style={{display:"flex",flexDirection:"column",gap:18}}>
          {NOTIF_CATS.map(cat=>{
            const group=items.filter(n=>n.cat===cat.key);
            if(!group.length)return null;
            return(
              <div key={cat.key}>
                <div style={{display:"flex",alignItems:"center",gap:7,margin:"0 0 8px"}}>
                  <span style={{fontSize:13}}>{cat.icon}</span>
                  <span style={{fontSize:11,fontWeight:700,color:C.slate500,textTransform:"uppercase",letterSpacing:"0.07em"}}>{cat.label}</span>
                  <span style={{fontSize:11,fontWeight:700,color:C.brand,background:C.brandLt,borderRadius:99,padding:"1px 8px"}}>{group.length}</span>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {group.map(n=>(
                    <div key={n.id} style={{display:"flex",gap:10,alignItems:"center",background:C.slate50,border:`1px solid ${C.slate100}`,borderRadius:10,padding:"11px 12px"}}>
                      <button onClick={()=>{onOpen(n.actId);onClose();}} style={{flex:1,display:"flex",gap:12,alignItems:"flex-start",textAlign:"left",background:"none",border:"none",cursor:"pointer",fontFamily:F.body,padding:0,minWidth:0}}>
                        <span style={{fontSize:16,lineHeight:1.3,flexShrink:0}}>{n.icon}</span>
                        <div style={{minWidth:0}}>
                          <div style={{fontWeight:600,fontSize:13.5,color:C.slate900}}>{n.title}</div>
                          <div style={{fontSize:12,color:C.slate500,marginTop:2}}>{n.sub}</div>
                        </div>
                      </button>
                      <button onClick={()=>onClearOne(n.id)} title="Dismiss" style={{flexShrink:0,width:24,height:24,borderRadius:6,border:"none",background:"transparent",color:C.slate400,fontSize:15,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",lineHeight:0}}>×</button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
};

// ─── Suggest a club (families crowdsource new listings to keep it fresh) ───────
const SuggestClubModal=({user,onClose})=>{
  const [f,setF]=useState({name:"",location:"",url:"",note:""});
  const [done,setDone]=useState(false);
  const [saving,setSaving]=useState(false);
  const submit=async()=>{
    if(!f.name.trim())return;
    setSaving(true);
    try{await store.set(`suggestion:${Date.now()}`,{...f,by:user?.email||"anon",byId:user?.id||"",at:new Date().toISOString(),status:"new"});setDone(true);}catch{}
    setSaving(false);
  };
  return(
    <Modal onClose={onClose} maxWidth={460}>
      {done?(
        <div style={{textAlign:"center",padding:"12px 0"}}>
          <div style={{fontSize:42,marginBottom:14}}>🙌</div>
          <h3 style={{margin:"0 0 8px",fontFamily:F.display,fontWeight:600,fontSize:20,color:C.slate900}}>Thank you</h3>
          <p style={{color:C.slate500,fontSize:14,lineHeight:1.6,margin:"0 0 22px"}}>We'll check out <strong>{f.name}</strong> and add it so other families can find it too.</p>
          <Btn full onClick={onClose}>Done</Btn>
        </div>
      ):(
        <>
          <h2 style={{margin:"0 0 4px",fontSize:20,fontWeight:700,color:C.slate900,fontFamily:F.display,paddingRight:32}}>Suggest a club</h2>
          <p style={{margin:"0 0 18px",fontSize:13,color:C.slate400}}>Know a holiday club or activity we're missing? Tell us and we'll add it.</p>
          <Input label="Name of the club or activity" value={f.name} onChange={e=>setF(s=>({...s,name:e.target.value}))} placeholder="e.g. Woking Holiday Sports Camp"/>
          <Input label="Town / area" value={f.location} onChange={e=>setF(s=>({...s,location:e.target.value}))} placeholder="e.g. Woking"/>
          <Input label="Website or link (optional)" value={f.url} onChange={e=>setF(s=>({...s,url:e.target.value}))} placeholder="https://…"/>
          <Textarea label="Anything else? (optional)" value={f.note} onChange={e=>setF(s=>({...s,note:e.target.value}))} placeholder="Dates, ages, who it's good for…"/>
          <Btn full loading={saving} disabled={!f.name.trim()} onClick={submit}>Send suggestion →</Btn>
        </>
      )}
    </Modal>
  );
};

// ─── Event carousel — clean, swipeable cards with a photo and position dots ────
const EventThumb=({img,emoji})=>{
  const [err,setErr]=useState(false);
  if(err||!img)return(
    <div style={{flexShrink:0,width:74,alignSelf:"stretch",minHeight:74,borderRadius:"14px 0 0 14px",background:"linear-gradient(135deg,#1D4ED8,#3B82F6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26}}>{emoji||"🏅"}</div>
  );
  return <img src={img} alt="" onError={()=>setErr(true)} style={{flexShrink:0,width:74,alignSelf:"stretch",minHeight:74,objectFit:"cover",borderRadius:"14px 0 0 14px",display:"block"}}/>;
};
// For now, the banner at the top of the Activities list shows our own apps instead of local events (families only).
// Set to false to bring the events banner back.
const PROMO_REPLACES_EVENTS=true;
const MoreFromCarousel=()=>{
  const ref=useRef(null);
  const [active,setActive]=useState(0);
  const items=[
    {id:"ehcp",kind:"ehcp",tag:"NEW",tagBg:"#E3B94E",tagInk:"#17214D",title:"Going through an EHCP?",blurb:"Advocate keeps every deadline, report, call and letter in one place. See what it does and how it works.",cta:"Find out more ↗"},
    {id:"pp",kind:"pp",tag:"FREE",tagBg:"#FF8A5B",tagInk:"#1B1530",title:"All About Me",blurb:"A one-page profile for your child: medicines, doctors, how they communicate. Free, and it uses your Finder login.",cta:"Find out more ↗"},
  ];
  const onScroll=()=>{const el=ref.current;if(!el)return;const w=el.firstChild?el.firstChild.getBoundingClientRect().width+12:el.clientWidth;setActive(Math.round(el.scrollLeft/w));};
  const go=i=>{const el=ref.current;if(!el||!el.children[i])return;el.children[i].scrollIntoView({behavior:"smooth",inline:"start",block:"nearest"});};
  return(
    <div style={{marginBottom:14}}>
      <div style={{fontSize:11,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",color:C.slate400,margin:"0 2px 7px"}}>More from IncludeMe</div>
      <div ref={ref} onScroll={onScroll} className="evt-scroll" style={{display:"flex",gap:12,overflowX:"auto",scrollSnapType:"x mandatory",WebkitOverflowScrolling:"touch",scrollbarWidth:"none",paddingBottom:2}}>
        <style>{`.evt-scroll::-webkit-scrollbar{display:none}`}</style>
        {items.map(it=>{const m=PROMOS[it.kind];return(
          <a key={it.id} href={m.href("finder_banner_"+it.kind)} target="_blank" rel="noopener noreferrer" style={{textDecoration:"none",flex:"0 0 92%",scrollSnapAlign:"start"}}>
            <div style={{display:"flex",alignItems:"stretch",background:C.white,border:`1px solid ${C.slate200}`,borderRadius:14,boxShadow:"0 4px 14px rgba(40,33,22,0.08)",overflow:"hidden",height:"100%"}}>
              <div style={{width:96,flexShrink:0,background:m.bg,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <img src={m.logo} alt="" width="52" height="52" style={{borderRadius:14}}/>
              </div>
              <div style={{flex:1,minWidth:0,padding:"12px 14px",display:"flex",flexDirection:"column",justifyContent:"center"}}>
                <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:4}}>
                  <span style={{fontSize:9,fontWeight:800,letterSpacing:"0.08em",color:it.tagInk,background:it.tagBg,borderRadius:5,padding:"2px 7px"}}>{it.tag}</span>
                  <span style={{fontSize:11,color:C.slate400,fontWeight:600,whiteSpace:"nowrap"}}>A separate app</span>
                </div>
                <div style={{color:C.slate900,fontWeight:700,fontSize:14.5,lineHeight:1.25,marginBottom:3}}>{it.title}</div>
                <div style={{color:C.slate500,fontSize:12,lineHeight:1.4,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{it.blurb}</div>
                <div style={{marginTop:7,color:C.brand,fontSize:12,fontWeight:700}}>{it.cta}</div>
              </div>
            </div>
          </a>);})}
      </div>
      <div style={{display:"flex",justifyContent:"center",gap:6,marginTop:9}}>
        {items.map((it,i)=>(
          <button key={it.id} onClick={()=>go(i)} aria-label={`Show ${it.kind==="ehcp"?"Advocate":"All About Me"}`} style={{width:active===i?18:7,height:7,borderRadius:99,border:"none",padding:0,cursor:"pointer",background:active===i?C.brand:C.slate300,transition:"all 0.2s"}}/>
        ))}
      </div>
    </div>
  );
};

const EventCarousel=({events})=>{
  const ref=useRef(null);
  const [active,setActive]=useState(0);
  if(!events.length)return null;
  const onScroll=()=>{
    const el=ref.current;if(!el)return;
    const w=el.firstChild?el.firstChild.getBoundingClientRect().width+12:el.clientWidth;
    setActive(Math.round(el.scrollLeft/w));
  };
  const go=i=>{const el=ref.current;if(!el||!el.children[i])return;el.children[i].scrollIntoView({behavior:"smooth",inline:"start",block:"nearest"});};
  return(
    <div style={{marginBottom:14}}>
      <div ref={ref} onScroll={onScroll} className="evt-scroll" style={{display:"flex",gap:12,overflowX:"auto",scrollSnapType:"x mandatory",WebkitOverflowScrolling:"touch",scrollbarWidth:"none",paddingBottom:2}}>
        <style>{`.evt-scroll::-webkit-scrollbar{display:none}`}</style>
        {events.map(e=>(
          <a key={e.id} href={e.url} target="_blank" rel="noreferrer" style={{textDecoration:"none",flex:events.length>1?"0 0 92%":"0 0 100%",scrollSnapAlign:"start"}}>
            <div style={{display:"flex",alignItems:"stretch",gap:0,background:C.white,border:`1px solid ${C.slate200}`,borderRadius:14,boxShadow:"0 4px 14px rgba(40,33,22,0.08)",overflow:"hidden",height:"100%"}}>
              <EventThumb img={e.img} emoji={e.emoji}/>
              <div style={{flex:1,minWidth:0,padding:"12px 14px",display:"flex",flexDirection:"column",justifyContent:"center"}}>
                <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:4}}>
                  <span style={{fontSize:9,fontWeight:800,letterSpacing:"0.08em",color:"#2563EB",background:"#EAF1FE",borderRadius:5,padding:"2px 7px",textTransform:"uppercase"}}>Event</span>
                  <span style={{fontSize:11,color:C.slate400,fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>📍 {e.area}</span>
                </div>
                <div style={{color:C.slate900,fontWeight:700,fontSize:14.5,lineHeight:1.25,marginBottom:3}}>{e.title}</div>
                <div style={{color:C.slate500,fontSize:12,lineHeight:1.4,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{e.blurb}</div>
                <div style={{marginTop:7,color:"#2563EB",fontSize:12,fontWeight:700}}>{e.cta}</div>
              </div>
            </div>
          </a>
        ))}
      </div>
      {events.length>1&&(
        <div style={{display:"flex",justifyContent:"center",gap:6,marginTop:9}}>
          {events.map((e,i)=>(
            <button key={e.id} onClick={()=>go(i)} aria-label={`Event ${i+1}`} style={{width:active===i?18:7,height:7,borderRadius:99,border:"none",padding:0,cursor:"pointer",background:active===i?"#2563EB":C.slate300,transition:"all 0.2s"}}/>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Location onboarding modal — shown once on open if no location saved ──────
const LocationOnboardModal=({onSet,onSkip})=>{
  const [input,setInput]=useState("");
  const [err,setErr]=useState("");
  const [using,setUsing]=useState(false);
  const tryPostcode=()=>{
    const raw=input.trim();if(!raw)return;
    const fmt=looksLikePostcode(raw)?formatPostcode(raw):raw;
    const r=resolveLocation(fmt);
    if(r){onSet({lat:r.lat,lng:r.lng},r.label);}
    else setErr("Location not found — try a postcode (e.g. GU22 9HP) or town.");
  };
  const useGPS=()=>{
    if(!navigator.geolocation){setErr("Location not available on this device.");return;}
    setUsing(true);setErr("");
    navigator.geolocation.getCurrentPosition(
      pos=>{setUsing(false);onSet({lat:pos.coords.latitude,lng:pos.coords.longitude},"Your location");},
      ()=>{setUsing(false);setErr("Couldn't get your location — enter a postcode instead.");}
    );
  };
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(26,23,18,0.55)",backdropFilter:"blur(6px)",zIndex:1200,display:"flex",alignItems:"flex-end",justifyContent:"center",padding:"0 0 env(safe-area-inset-bottom)"}}>
      <div style={{background:C.white,borderRadius:"20px 20px 0 0",padding:"28px 24px 32px",width:"100%",maxWidth:540,boxShadow:"0 -12px 40px rgba(0,0,0,0.18)"}}>
        <div style={{width:40,height:4,background:C.slate200,borderRadius:2,margin:"0 auto 22px"}}/>
        <div style={{fontSize:28,marginBottom:10,textAlign:"center"}}>📍</div>
        <h2 style={{margin:"0 0 8px",fontFamily:F.display,fontWeight:700,fontSize:20,color:C.slate900,textAlign:"center"}}>Find activities near you</h2>
        <p style={{margin:"0 0 22px",color:C.slate500,fontSize:14,textAlign:"center",lineHeight:1.55}}>Enter your town or postcode and we'll show you SEND activities, holiday clubs and events within 20 miles.</p>
        <div style={{display:"flex",gap:8,marginBottom:12}}>
          <input
            style={{flex:1,padding:"11px 14px",border:`1.5px solid ${err?C.red:C.slate300}`,borderRadius:10,fontSize:14,fontFamily:F.body,outline:"none"}}
            placeholder="Postcode or town (e.g. GU22, Guildford)"
            value={input} onChange={e=>{setInput(e.target.value);setErr("");}}
            onKeyDown={e=>e.key==="Enter"&&tryPostcode()}
          />
          <button onClick={tryPostcode} style={{padding:"11px 18px",borderRadius:10,border:"none",background:C.brand,color:"white",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:F.body,flexShrink:0}}>Go</button>
        </div>
        {err&&<p style={{color:C.red,fontSize:12.5,margin:"0 0 12px"}}>{err}</p>}
        <button onClick={useGPS} disabled={using} style={{width:"100%",padding:"11px",borderRadius:10,border:`1.5px solid ${C.slate200}`,background:C.slate50,color:C.slate700,fontWeight:600,fontSize:13.5,cursor:"pointer",fontFamily:F.body,display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginBottom:14}}>
          {using?"Locating…":"📡 Use my current location"}
        </button>
        <button onClick={onSkip} style={{width:"100%",background:"none",border:"none",color:C.slate400,fontSize:13,cursor:"pointer",fontFamily:F.body}}>Skip for now — I'll set it in filters</button>
      </div>
    </div>
  );
};

// ─── Push notification subscription modal ────────────────────────────────────
// Requests browser notification permission, captures the push subscription, and
// stores it with the family's preferences (radius / types / frequency).
// ⚠️ SENDING SEAM: store.set(`notif_sub:${userId}`, sub) holds the push
// subscription + prefs. A backend (web-push + VAPID keys, triggered on a cron or
// a "listing added near subscriber" event) reads these keys and pushes alerts.
// NOTE: web push needs a service worker + VAPID public key in production. On iOS
// the family must "Add to Home Screen" first (Apple restriction) to receive push.
const VAPID_PUBLIC_KEY = "BJrGbG_SW1N6NV6M74mmvepDLr2UokKpg2RQWtyRPFWrRFuGQcOOF220rMWoOcQl1Cx3iqveQAamCusVGvLvMGU"; // public key only — matching private key lives in Netlify env vars (VAPID_PRIVATE_KEY), never in client code.
const urlBase64ToUint8Array=(b64)=>{
  const pad="=".repeat((4-b64.length%4)%4);
  const base64=(b64+pad).replace(/-/g,"+").replace(/_/g,"/");
  const raw=atob(base64);const arr=new Uint8Array(raw.length);
  for(let i=0;i<raw.length;i++)arr[i]=raw.charCodeAt(i);
  return arr;
};
const NotifSubModal=({user,userLoc,locLabel,onSave,onClose})=>{
  const [radius,setRadius]=useState(20);
  const [types,setTypes]=useState({newActivities:true,holidayClubs:true,newEvents:true,availability:true});
  const [saving,setSaving]=useState(false);
  const [done,setDone]=useState(false);
  const [err,setErr]=useState("");
  const toggle=k=>setTypes(t=>({...t,[k]:!t[k]}));
  const enable=async()=>{
    setSaving(true);setErr("");

    // Native app (Android/iOS via Capacitor): this modal previously only
    // knew about browser push (the `Notification` global), which Capacitor's
    // WebView doesn't expose — so every native user hit "This device or
    // browser doesn't support notifications" immediately, even though
    // native push itself works fine via the Capacitor plugin (confirmed
    // working end-to-end separately). This branch lets the same "Enable
    // notifications" button actually complete the native registration,
    // using the location/radius/types the user just chose in this modal
    // rather than whatever was set (or not yet set) at app launch.
    const cap=typeof window!=="undefined"?window.Capacitor:null;
    if(cap&&cap.isNativePlatform&&cap.isNativePlatform()){
      try{
        const{PushNotifications}=await import("@capacitor/push-notifications");
        let perm=await PushNotifications.checkPermissions();
        if(perm.receive==="prompt")perm=await PushNotifications.requestPermissions();
        if(perm.receive!=="granted"){
          setErr("Notifications are blocked. You can enable them in your device settings and try again.");setSaving(false);return;
        }
        await PushNotifications.register();
        await new Promise(resolve=>{
          let settled=false;
          const finish=()=>{if(!settled){settled=true;resolve();}};
          PushNotifications.addListener("registration",async tokenData=>{
            const token=tokenData?.value;
            if(token){
              try{
                const{data:{session}}=await sb.auth.getSession();
                await fetch(`${API_BASE}/.netlify/functions/save-fcm-token`,{
                  method:"POST",
                  headers:{"Content-Type":"application/json",...(session?.access_token?{Authorization:`Bearer ${session.access_token}`}:{})},
                  body:JSON.stringify({token,loc:userLoc||null,locLabel:locLabel||"",radius,types}),
                });
              }catch{ /* non-critical — token may already be saved from launch */ }
            }
            finish();
          });
          PushNotifications.addListener("registrationError",()=>finish());
          setTimeout(finish,6000); // safety net in case neither event fires
        });
        if(onSave)await onSave({channel:"push-native",permission:"granted",radius,types,loc:userLoc||null,locLabel:locLabel||"",updatedAt:new Date().toISOString(),userId:user&&user.id?user.id:null});
        setDone(true);setSaving(false);return;
      }catch{
        setErr("Couldn't enable notifications. Please try again.");setSaving(false);return;
      }
    }

    let pushSub=null;
    try{
      if(typeof Notification==="undefined"){
        setErr("This device or browser doesn't support notifications.");setSaving(false);return;
      }
      const perm=await Notification.requestPermission();
      if(perm!=="granted"){
        setErr("Notifications are blocked. You can enable them in your browser settings and try again.");setSaving(false);return;
      }
      // Capture the push subscription if a service worker + VAPID key are available
      if("serviceWorker" in navigator && "PushManager" in window && VAPID_PUBLIC_KEY){
        try{
          const reg=await navigator.serviceWorker.ready;
          const existing=await reg.pushManager.getSubscription();
          pushSub=existing||await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:urlBase64ToUint8Array(VAPID_PUBLIC_KEY)});
        }catch{ /* SW/VAPID not ready — permission still granted; backend can complete later */ }
      }
    }catch{
      setErr("Couldn't enable notifications. Please try again.");setSaving(false);return;
    }
    const sub={channel:"push",permission:"granted",pushSubscription:pushSub?JSON.parse(JSON.stringify(pushSub)):null,radius,types,loc:userLoc||null,locLabel:locLabel||"",updatedAt:new Date().toISOString(),userId:user&&user.id?user.id:null};
    try{
      await store.set(`notif_sub:${user&&user.id?user.id:"anon"}`,sub);
      if(onSave)await onSave(sub);
      setDone(true);
    }catch{ setErr("Couldn't save your preferences. Please try again."); }
    setSaving(false);
  };
  return(
    <Modal onClose={onClose} maxWidth={460}>
      {done?(
        <div style={{textAlign:"center",padding:"12px 0"}}>
          <div style={{fontSize:40,marginBottom:12}}>🔔</div>
          <h3 style={{margin:"0 0 8px",fontFamily:F.display,fontWeight:700,fontSize:20,color:C.slate900}}>Notifications on</h3>
          <p style={{color:C.slate500,fontSize:14,lineHeight:1.6,margin:"0 0 8px"}}>We'll send you a push notification when new activities, holiday clubs and events are added{locLabel?` near ${locLabel}`:""} within {radius} miles.</p>
          <p style={{color:C.slate400,fontSize:12.5,margin:"0 0 22px"}}>You can change this anytime in your account settings.</p>
          <Btn full onClick={onClose}>Done</Btn>
        </div>
      ):(
        <>
          <div style={{textAlign:"center",marginBottom:6}}><span style={{fontSize:34}}>🔔</span></div>
          <h2 style={{margin:"0 0 4px",fontSize:20,fontWeight:700,color:C.slate900,fontFamily:F.display,textAlign:"center"}}>Turn on notifications</h2>
          <p style={{margin:"0 0 20px",fontSize:13,color:C.slate500,lineHeight:1.5,textAlign:"center"}}>Get a notification the moment new activities, holiday clubs and events appear near you — no need to keep checking back.</p>
          <div style={{marginBottom:16}}>
            <label style={{fontSize:12,fontWeight:700,color:C.slate500,textTransform:"uppercase",letterSpacing:"0.07em",display:"block",marginBottom:10}}>Notify me about</label>
            {[["newActivities","New activities near me"],["holidayClubs","New holiday clubs & sessions"],["newEvents","Special events in my area"],["availability","Availability updates (saved clubs)"]].map(([k,lbl])=>(
              <button key={k} onClick={()=>toggle(k)} style={{display:"flex",alignItems:"center",gap:10,width:"100%",background:types[k]?C.brandLt:C.slate50,border:`1.5px solid ${types[k]?C.brand:C.slate200}`,borderRadius:10,padding:"10px 14px",marginBottom:8,cursor:"pointer",fontFamily:F.body,textAlign:"left"}}>
                <div style={{width:20,height:20,borderRadius:5,border:`2px solid ${types[k]?C.brand:C.slate300}`,background:types[k]?C.brand:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  {types[k]&&<span style={{color:"#fff",fontSize:13,lineHeight:0}}>✓</span>}
                </div>
                <span style={{fontSize:13.5,fontWeight:types[k]?600:400,color:types[k]?C.brand:C.slate600}}>{lbl}</span>
              </button>
            ))}
          </div>
          <div style={{marginBottom:20}}>
            <label style={{fontSize:12,fontWeight:700,color:C.slate500,textTransform:"uppercase",letterSpacing:"0.07em",display:"block",marginBottom:10}}>Search radius</label>
            <div style={{display:"flex",gap:8}}>
              {[10,20,30,50].map(r=>(
                <button key={r} onClick={()=>setRadius(r)} style={{flex:1,padding:"8px 0",borderRadius:9,border:`1.5px solid ${radius===r?C.brand:C.slate200}`,background:radius===r?C.brand:C.white,color:radius===r?"#fff":C.slate500,fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:F.body}}>{r}mi</button>
              ))}
            </div>
          </div>
          {locLabel&&<p style={{fontSize:12,color:C.slate400,margin:"0 0 16px"}}>📍 Based on your saved location: <strong>{locLabel}</strong></p>}
          {err&&<p style={{fontSize:12.5,color:C.red,margin:"0 0 12px",lineHeight:1.5}}>{err}</p>}
          <Btn full loading={saving} onClick={enable}>🔔 Enable notifications</Btn>
          <p style={{fontSize:11.5,color:C.slate400,textAlign:"center",marginTop:10}}>Your browser will ask for permission. Turn off anytime in settings.</p>
        </>
      )}
    </Modal>
  );
};

// ─── Weekly email digest subscription form ───────────────────────────────────
// ⚠️ SENDING SEAM: store.set(`email_sub:${userId}`, sub) is the data model.
// A weekly cron reads email_sub: keys and sends digests of new activities +
// holiday clubs + events near each subscriber via Resend / SendGrid.
const WeeklyEmailForm=({user,onSave})=>{
  const [email,setEmail]=useState((user&&user.email)||"");
  const [day,setDay]=useState("Monday");
  const [types,setTypes]=useState({newActivities:true,holidayClubs:true,events:true});
  const [saved,setSaved]=useState(false);
  const save=async()=>{
    if(!email.trim())return;
    const sub={email:email.trim().toLowerCase(),day,types,radius:(user&&user.notifSub&&user.notifSub.radius)||20,loc:(user&&user.savedLoc)||null,locLabel:(user&&user.savedLocLabel)||"",userId:user&&user.id?user.id:null,createdAt:new Date().toISOString()};
    await onSave(sub);setSaved(true);
  };
  if(saved)return <p style={{color:C.brand,fontSize:13,fontWeight:600}}>✓ Weekly digest set up — you'll receive your first email next {day}.</p>;
  return(
    <div style={{background:C.slate50,borderRadius:10,padding:14,border:`1px solid ${C.slate200}`}}>
      <Input label="Email address" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="your@email.com"/>
      <div style={{marginBottom:12}}>
        <label style={{fontSize:12,fontWeight:600,color:C.slate500,display:"block",marginBottom:8}}>Send on</label>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {["Monday","Tuesday","Wednesday","Thursday","Friday"].map(d=>(
            <button key={d} onClick={()=>setDay(d)} style={{padding:"5px 12px",borderRadius:8,border:`1.5px solid ${day===d?C.brand:C.slate200}`,background:day===d?C.brand:C.white,color:day===d?"#fff":C.slate500,fontSize:12,fontWeight:day===d?700:400,cursor:"pointer",fontFamily:F.body}}>{d.slice(0,3)}</button>
          ))}
        </div>
      </div>
      <div style={{marginBottom:14}}>
        <label style={{fontSize:12,fontWeight:600,color:C.slate500,display:"block",marginBottom:8}}>Include</label>
        {[["newActivities","New activities near me"],["holidayClubs","Holiday clubs with spaces"],["events","Upcoming events"]].map(([k,lbl])=>(
          <label key={k} style={{display:"flex",alignItems:"center",gap:8,fontSize:13,color:C.slate700,marginBottom:6,cursor:"pointer"}}>
            <input type="checkbox" checked={types[k]} onChange={()=>setTypes(t=>({...t,[k]:!t[k]}))} style={{accentColor:C.brand}}/>
            {lbl}
          </label>
        ))}
      </div>
      <Btn onClick={save} disabled={!email.trim()}>Set up weekly digest</Btn>
    </div>
  );
};

// ─── Share card — for families to tell other SEND parents about IncludeMe ─────
const SHARE_URL="https://includeme.uk";
// Admin panel access — exact-match only (no substring match, no URL bypass).
// IMPORTANT: replace with your real account email(s) before shipping. This list
// must also be kept in sync with the is_admin() check in supabase/schema.sql —
// the database policy is what actually enforces this; this list only controls
// whether the UI shows/opens the admin panel for you.
const ADMIN_EMAILS=["paul_whitehouse1@yahoo.co.uk"];
const SHARE_MESSAGE=`I found this really useful — IncludeMe is a free directory of SEND activities, holiday clubs, therapies and charities near you. Worth a look: ${SHARE_URL}`;
const ShareCard=()=>{
  const [copied,setCopied]=useState(false);
  const canShare=typeof navigator!=="undefined"&&navigator.share;
  const doShare=async()=>{
    if(canShare){
      try{ await navigator.share({title:"IncludeMe",text:SHARE_MESSAGE,url:SHARE_URL}); return; }catch{ /* user cancelled or unsupported — fall through */ }
    }
    copy();
  };
  const copy=()=>{
    if(navigator.clipboard)navigator.clipboard.writeText(SHARE_MESSAGE);
    setCopied(true);setTimeout(()=>setCopied(false),2500);
  };
  return(
    <div style={{background:"linear-gradient(135deg,#0A5044,#0F6B5C)",borderRadius:14,padding:"18px 20px",marginBottom:20}}>
      <div style={{fontSize:24,marginBottom:8}}>💚</div>
      <div style={{fontWeight:700,color:"#fff",fontSize:15,marginBottom:4,fontFamily:F.display}}>Know another SEND family?</div>
      <p style={{margin:"0 0 14px",fontSize:13,color:"rgba(255,255,255,0.82)",lineHeight:1.5}}>
        IncludeMe grows through word of mouth between families. If it's been useful, sharing it with one other parent helps more children find the support they need.
      </p>
      <div style={{display:"flex",gap:8}}>
        <button onClick={doShare} style={{flex:1,padding:"10px",borderRadius:10,border:"none",background:"#fff",color:C.brand,fontWeight:700,fontSize:13.5,cursor:"pointer",fontFamily:F.body,display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>
          {canShare?"📤 Share":"🔗 Copy link to share"}
        </button>
        {canShare&&<button onClick={copy} title="Copy link" style={{flexShrink:0,padding:"10px 14px",borderRadius:10,border:"1.5px solid rgba(255,255,255,0.35)",background:"rgba(255,255,255,0.12)",color:"#fff",fontWeight:600,fontSize:13,cursor:"pointer",fontFamily:F.body}}>🔗</button>}
      </div>
      {copied&&<div style={{marginTop:10,fontSize:12.5,color:"#fff",fontWeight:600}}>✓ Copied — paste it in a message or group chat</div>}
    </div>
  );
};

// ─── "Find us on IncludeMe" badge — providers can embed on their own website ──
const BADGE_SNIPPET=(slug)=>`<a href="${SHARE_URL}/${slug||""}" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:8px;padding:8px 14px;background:#0F6B5C;color:#fff;border-radius:10px;text-decoration:none;font-family:sans-serif;font-size:13px;font-weight:700;">
  <span style="font-size:16px;">💚</span> Find us on IncludeMe
</a>`;
const ProviderBadgeCard=({act})=>{
  const [copied,setCopied]=useState(false);
  const slug=act&&act.id?`listing/${act.id}`:"";
  const snippet=BADGE_SNIPPET(slug);
  const copy=()=>{ if(navigator.clipboard)navigator.clipboard.writeText(snippet); setCopied(true);setTimeout(()=>setCopied(false),2500); };
  return(
    <div style={{background:C.slate50,borderRadius:12,padding:16,border:`1px solid ${C.slate200}`}}>
      <div style={{fontWeight:700,color:C.slate800,fontSize:14,marginBottom:4}}>💚 "Find us on IncludeMe" badge</div>
      <p style={{margin:"0 0 12px",fontSize:12.5,color:C.slate500,lineHeight:1.5}}>Add this badge to your website so families know you're listed — and it links straight back to your IncludeMe page.</p>
      <div style={{background:"#1E293B",borderRadius:9,padding:12,marginBottom:10,overflowX:"auto"}}>
        <pre style={{margin:0,fontSize:11,color:"#E2E8F0",fontFamily:"monospace",lineHeight:1.6,whiteSpace:"pre"}}>{snippet}</pre>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <button onClick={copy} style={{padding:"8px 16px",borderRadius:9,border:"none",background:C.brand,color:"#fff",fontWeight:700,fontSize:12.5,cursor:"pointer",fontFamily:F.body}}>Copy code</button>
        {copied&&<span style={{fontSize:12.5,color:C.brand,fontWeight:600}}>✓ Copied</span>}
        <span style={{marginLeft:"auto",flexShrink:0}}>
          <a href={`${SHARE_URL}/${slug}`} target="_blank" rel="noreferrer" style={{display:"inline-flex",alignItems:"center",gap:7,padding:"8px 13px",background:C.brand,color:"#fff",borderRadius:9,textDecoration:"none",fontSize:12.5,fontWeight:700,fontFamily:"sans-serif"}}>
            💚 Preview badge
          </a>
        </span>
      </div>
    </div>
  );
};

const HolidayPlannerModal=({user,activities,userLoc,onClose,inline})=>{
  const [plan,setPlan]=useState(null); // {entries:[{id,date,actId,actName,actOrg,actLocation}]}
  const [selHol,setSelHol]=useState(0);
  const [addDay,setAddDay]=useState(null); // ISO date to add activity to
  const [search,setSearch]=useState("");
  const [saving,setSaving]=useState(false);
  const KEY=`holiday_plan:${user.id}`;

  useEffect(()=>{
    store.get(KEY).then(v=>setPlan(v||{entries:[]})).catch(()=>setPlan({entries:[]}));
  },[KEY]);

  const save=async(newPlan)=>{
    setSaving(true);
    try{ await store.set(KEY,newPlan); }catch{}
    setSaving(false);
  };

  const addEntry=(date,act)=>{
    const entry={id:`pe-${Date.now()}`,date,actId:act.id,actName:act.name,actOrg:act.organisation,actLocation:act.location};
    const updated={...plan,entries:[...plan.entries,entry]};
    setPlan(updated);save(updated);setAddDay(null);setSearch("");
  };

  const removeEntry=(entryId)=>{
    const updated={...plan,entries:plan.entries.filter(e=>e.id!==entryId)};
    setPlan(updated);save(updated);
  };

  const upcoming=UK_HOLIDAYS.filter(h=>{
    const d=new Date(h.start+"T00:00:00");const t=new Date(todayISO()+"T00:00:00");
    return d>=new Date(t.getTime()-86400000*14); // include if started within 14 days
  }).slice(0,4);

  if(!upcoming.length)return(
    <Modal onClose={onClose} maxWidth={540}>
      <h2 style={{margin:"0 0 8px",fontFamily:F.display,fontWeight:700,fontSize:20,color:C.slate900,paddingRight:32}}>Holiday Planner</h2>
      <p style={{color:C.slate400,fontSize:13}}>No upcoming school holidays found.</p>
    </Modal>
  );

  const hol=upcoming[selHol];
  // Build the list of days in this holiday
  const holDays=Array.from({length:hol.days},(_,i)=>{
    const d=new Date(hol.start+"T00:00:00");d.setDate(d.getDate()+i);
    return d.toISOString().slice(0,10);
  });
  const entriesForHol=(plan?plan.entries:[]).filter(e=>holDays.includes(e.date));
  const daysWithPlan=new Set(entriesForHol.map(e=>e.date));
  const freeDays=holDays.filter(d=>!daysWithPlan.has(d)).length;

  // Activities to add: all non-charity activities, saved first then nearby then rest
  const favIds=new Set((user.favourites||[]));
  const allActivities=(activities||[]).filter(a=>a.category!=="charity");
  const searchFiltered=search
    ? allActivities.filter(a=>a.name.toLowerCase().includes(search.toLowerCase())||a.organisation.toLowerCase().includes(search.toLowerCase()))
    : allActivities;
  const suggested=searchFiltered.sort((a,b)=>{
    const aFav=favIds.has(a.id)?0:1, bFav=favIds.has(b.id)?0:1;
    if(aFav!==bFav)return aFav-bFav;
    const aDist=userLoc&&a.lat&&a.lng?haversine(userLoc.lat,userLoc.lng,a.lat,a.lng):9999;
    const bDist=userLoc&&b.lat&&b.lng?haversine(userLoc.lat,userLoc.lng,b.lat,b.lng):9999;
    return aDist-bDist;
  }).slice(0,40);

  const dayLabel=(iso)=>{
    const d=new Date(iso+"T00:00:00");
    return d.toLocaleDateString("en-GB",{weekday:"short",day:"numeric",month:"short"});
  };
  const isWeekend=(iso)=>{const d=new Date(iso+"T00:00:00").getDay();return d===0||d===6;};

  const content=(
    <>
      {!inline&&<h2 style={{margin:"0 0 16px",fontFamily:F.display,fontWeight:700,fontSize:20,color:C.slate900,paddingRight:32}}>Holiday Planner</h2>}
      {/* Holiday selector */}
      <div style={{display:"flex",gap:8,overflowX:"auto",marginBottom:18,paddingBottom:2}}>
        {upcoming.map((h,i)=>(
          <button key={h.start} onClick={()=>setSelHol(i)} style={{flexShrink:0,padding:"7px 14px",borderRadius:9,border:`1.5px solid ${selHol===i?C.brand:C.slate200}`,background:selHol===i?C.brand:C.white,color:selHol===i?"#fff":C.slate600,fontSize:12.5,fontWeight:selHol===i?700:500,cursor:"pointer",fontFamily:F.body,whiteSpace:"nowrap"}}>
            {h.name.replace(" holidays","").replace(" half-term"," h/t")}
          </button>
        ))}
      </div>
      {/* Stats bar */}
      <div style={{display:"flex",gap:10,marginBottom:16}}>
        <div style={{flex:1,background:C.brandLt,borderRadius:10,padding:"10px 14px",textAlign:"center"}}>
          <div style={{fontWeight:700,fontSize:20,color:C.brand}}>{entriesForHol.length}</div>
          <div style={{fontSize:11,color:C.slate500}}>Activities planned</div>
        </div>
        <div style={{flex:1,background:freeDays>10?"#FFF7E6":"#F0FDF4",borderRadius:10,padding:"10px 14px",textAlign:"center"}}>
          <div style={{fontWeight:700,fontSize:20,color:freeDays>10?"#D97706":C.green}}>{freeDays}</div>
          <div style={{fontSize:11,color:C.slate500}}>Days with gaps</div>
        </div>
        <div style={{flex:1,background:C.slate50,borderRadius:10,padding:"10px 14px",textAlign:"center"}}>
          <div style={{fontWeight:700,fontSize:20,color:C.slate700}}>{hol.days}</div>
          <div style={{fontSize:11,color:C.slate500}}>Total days</div>
        </div>
      </div>
      {!plan?<p style={{color:C.slate400,fontSize:13}}>Loading…</p>:(
        <div style={{maxHeight:340,overflowY:"auto",marginBottom:16}}>
          {holDays.map(day=>{
            const dayEntries=entriesForHol.filter(e=>e.date===day);
            const isWknd=isWeekend(day);
            return(
              <div key={day} style={{display:"flex",gap:10,alignItems:"flex-start",padding:"8px 0",borderBottom:`1px solid ${C.slate100}`}}>
                <div style={{width:86,flexShrink:0,paddingTop:2}}>
                  <div style={{fontSize:12,fontWeight:700,color:isWknd?C.brand:C.slate600}}>{dayLabel(day)}</div>
                  {isWknd&&<div style={{fontSize:10,color:C.brand,fontWeight:600}}>Weekend</div>}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  {dayEntries.map(e=>(
                    <div key={e.id} style={{display:"flex",alignItems:"center",gap:8,background:C.brandLt,borderRadius:8,padding:"6px 10px",marginBottom:5}}>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:12.5,fontWeight:600,color:C.brand,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{e.actName}</div>
                        <div style={{fontSize:11,color:C.slate500}}>{e.actOrg} · {e.actLocation}</div>
                      </div>
                      <button onClick={()=>removeEntry(e.id)} style={{flexShrink:0,background:"none",border:"none",color:C.slate400,fontSize:16,cursor:"pointer",lineHeight:1,padding:0}}>×</button>
                    </div>
                  ))}
                  <button onClick={()=>setAddDay(addDay===day?null:day)} style={{fontSize:11.5,color:dayEntries.length?C.slate400:C.brand,background:"none",border:`1px dashed ${dayEntries.length?C.slate200:C.brand}`,borderRadius:7,padding:"4px 10px",cursor:"pointer",fontFamily:F.body,fontWeight:600}}>
                    {addDay===day?"Cancel":"+ Add activity"}
                  </button>
                  {addDay===day&&(
                    <div style={{marginTop:8,background:C.slate50,borderRadius:10,padding:10}}>
                      <input style={{width:"100%",padding:"7px 10px",border:`1.5px solid ${C.slate200}`,borderRadius:8,fontSize:12.5,fontFamily:F.body,outline:"none",boxSizing:"border-box",marginBottom:8}} placeholder="Search activities…" value={search} onChange={e=>setSearch(e.target.value)}/>
                      <div style={{maxHeight:160,overflowY:"auto"}}>
                        {suggested.length===0&&<p style={{color:C.slate400,fontSize:12,padding:"6px 0"}}>No activities found. Try a different search.</p>}
                        {suggested.map(a=>(
                          <button key={a.id} onClick={()=>addEntry(day,a)} style={{display:"flex",gap:8,alignItems:"flex-start",width:"100%",background:C.white,border:`1px solid ${C.slate100}`,borderRadius:8,padding:"8px 10px",marginBottom:6,cursor:"pointer",fontFamily:F.body,textAlign:"left"}}>
                            <div style={{flex:1,minWidth:0}}>
                              <div style={{fontSize:12.5,fontWeight:600,color:C.slate800}}>{a.name}</div>
                              <div style={{fontSize:11,color:C.slate500}}>{a.organisation} · {a.location}</div>
                            </div>
                            {favIds.has(a.id)&&<span style={{fontSize:10,color:C.brand,fontWeight:700,flexShrink:0}}>★ Saved</span>}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {saving&&<p style={{fontSize:11.5,color:C.slate400,textAlign:"right",margin:0}}>Saving…</p>}
    </>
  );
  return inline ? <div>{content}</div> : <Modal onClose={onClose} maxWidth={560}>{content}</Modal>;
};

// ─── Direct Enquiry Modal ─────────────────────────────────────────────────────
const EMAIL_LOOKS_VALID=e=>!!e&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

const EnquiryModal=({act,user,onClose})=>{
  const [msg,setMsg]=useState("");
  const [phone,setPhone]=useState("");
  const [sent,setSent]=useState(false);
  // Three distinct outcomes — important not to conflate "no email exists"
  // with "an email exists but we couldn't confirm it sent" (e.g. the
  // sending function being unreachable). Saying "no email on file" when one
  // genuinely exists in the data would be actively misleading.
  const [outcome,setOutcome]=useState("emailed"); // "emailed" | "noEmailOnFile" | "unconfirmed"
  const [saving,setSaving]=useState(false);
  const [err,setErr]=useState("");
  const hasRealEmail=EMAIL_LOOKS_VALID(act.contactEmail);
  const send=async()=>{
    if(!msg.trim()){setErr("Please write a message.");return;}
    setSaving(true);setErr("");
    const enquiry={id:`enq-${Date.now()}`,actId:act.id,actName:act.name,fromUserId:user.id,fromName:user.name||user.email,fromEmail:user.email,fromPhone:phone.trim()||null,message:msg.trim(),sentAt:new Date().toISOString(),read:false};
    try{
      // The actual save-to-inbox write now happens server-side in
      // send-enquiry-email.js using admin privileges — RLS structurally
      // can't allow the family's own session to write into a row keyed by
      // the listing owner's id (a different person), so that write always
      // silently failed when attempted from here. We still call the
      // function even when there's no valid email on file, so the inbox
      // copy is saved either way; the function itself skips just the
      // email-sending step in that case.
      let confirmed=false;
      try{
        const{data:{session}}=await sb.auth.getSession();
        if(session?.access_token){
          const res=await fetch(`${API_BASE}/.netlify/functions/send-enquiry-email`,{
            method:"POST",
            headers:{"Content-Type":"application/json",Authorization:`Bearer ${session.access_token}`},
            body:JSON.stringify({toEmail:act.contactEmail,toName:act.organisation,actName:act.name,actId:act.id,ownerId:act.ownerId,fromName:enquiry.fromName,fromEmail:enquiry.fromEmail,fromPhone:enquiry.fromPhone,message:enquiry.message})
          });
          if(res.ok){const body=await res.json();confirmed=!!body.sent;}
        }
      }catch{ /* function unreachable — fall through to "unconfirmed" below */ }

      if(!hasRealEmail){
        setOutcome("noEmailOnFile");
      }else{
        // We know there IS a real-looking email on file at this point;
        // what's uncertain is only whether the send itself succeeded (e.g.
        // this function not being deployed/reachable, a transient Resend
        // error) — so on any failure here we say "unconfirmed," never "no
        // email exists."
        setOutcome(confirmed?"emailed":"unconfirmed");
      }

      setSent(true);
    }catch{ setErr("Something went wrong. Please try again."); }
    setSaving(false);
  };
  return(
    <Modal onClose={onClose} maxWidth={460}>
      {sent?(
        <div style={{textAlign:"center",padding:"12px 0"}}>
          <div style={{fontSize:40,marginBottom:10}}>✅</div>
          <h3 style={{margin:"0 0 8px",fontFamily:F.display,fontWeight:700,fontSize:19,color:C.slate900}}>Message sent</h3>
          {outcome==="emailed"&&(
            <p style={{color:C.slate500,fontSize:13.5,lineHeight:1.6}}>Your enquiry has been emailed directly to <strong>{act.organisation}</strong>. They can reply straight to your email address.</p>
          )}
          {outcome==="noEmailOnFile"&&(
            <>
              <p style={{color:C.slate500,fontSize:13.5,lineHeight:1.6}}>We've saved your enquiry, but <strong>{act.organisation}</strong> doesn't have a direct email on file with us — so we can't confirm they'll see it here.</p>
              <p style={{color:C.amber,fontSize:12.5,lineHeight:1.6,marginTop:8,fontWeight:600}}>To be safe, we'd recommend also contacting them directly{act.contactPhone?` on ${act.contactPhone}`:act.website?" via their website":""}.</p>
            </>
          )}
          {outcome==="unconfirmed"&&(
            <>
              <p style={{color:C.slate500,fontSize:13.5,lineHeight:1.6}}>We've saved your enquiry and attempted to email <strong>{act.organisation}</strong> directly, but couldn't confirm it sent.</p>
              <p style={{color:C.amber,fontSize:12.5,lineHeight:1.6,marginTop:8,fontWeight:600}}>To be safe, you may also want to contact them directly{act.contactPhone?` on ${act.contactPhone}`:act.website?" via their website":""}.</p>
            </>
          )}
          <div style={{marginTop:20}}><Btn full onClick={onClose}>Done</Btn></div>
        </div>
      ):(
        <>
          <h2 style={{margin:"0 0 4px",fontSize:18,fontWeight:700,color:C.slate900,fontFamily:F.display,paddingRight:32}}>Enquire about</h2>
          <p style={{margin:"0 0 18px",fontSize:13,color:C.slate500}}>{act.name} · {act.organisation}</p>
          <Textarea label="Your message" value={msg} onChange={e=>setMsg(e.target.value)} placeholder={`Hi, I'd like to find out more about ${act.name}…`} rows={4}/>
          <Input label="Phone number (optional)" type="tel" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="07700 000000"/>
          <p style={{fontSize:12,color:C.slate400,margin:"0 0 16px"}}>Sending as <strong>{user.name||user.email}</strong> · {user.email}</p>
          {err&&<p style={{color:C.red,fontSize:12.5,margin:"0 0 10px"}}>{err}</p>}
          <Btn full loading={saving} onClick={send}>Send enquiry →</Btn>
        </>
      )}
    </Modal>
  );
};

// ─── Main App ─────────────────────────────────────────────────────────────────
// ─── Install banner — prompts iOS users to add to Home Screen, and Android
// web visitors to get the real native app from Google Play, instead of
// using the browser version. Hidden entirely when already running as the
// native Capacitor app or as an installed PWA (no point telling someone
// to install something they've already installed).
const INSTALL_BANNER_DISMISS_KEY="installBannerDismissedAt";
const InstallBanner=()=>{
  const [dismissed,setDismissed]=useState(()=>{
    try{return !!localStorage.getItem(INSTALL_BANNER_DISMISS_KEY);}catch{return false;}
  });
  if(dismissed)return null;
  if(typeof window==="undefined")return null;
  const isNative=!!(window.Capacitor&&window.Capacitor.isNativePlatform&&window.Capacitor.isNativePlatform());
  const isStandalone=!!(window.navigator.standalone||(window.matchMedia&&window.matchMedia("(display-mode: standalone)").matches));
  if(isNative||isStandalone)return null;
  const ua=navigator.userAgent||"";
  const isIOS=/iPad|iPhone|iPod/.test(ua)&&!window.MSStream;
  const isAndroid=/Android/.test(ua);
  if(!isIOS&&!isAndroid)return null;
  const dismiss=()=>{
    try{localStorage.setItem(INSTALL_BANNER_DISMISS_KEY,new Date().toISOString());}catch{}
    setDismissed(true);
  };
  return(
    <div style={{background:C.brandDk,padding:"10px 16px",display:"flex",alignItems:"center",gap:10}}>
      <div style={{maxWidth:1080,margin:"0 auto",width:"100%",display:"flex",alignItems:"center",gap:10}}>
        <span style={{fontSize:18,flexShrink:0}}>{isIOS?"📲":"📱"}</span>
        {isIOS?(
          <span style={{flex:1,color:"#fff",fontSize:12.5,lineHeight:1.4}}>
            <strong>Add IncludeMe to your Home Screen</strong> — tap the Share button, then "Add to Home Screen"
          </span>
        ):(
          <span style={{flex:1,color:"#fff",fontSize:12.5,lineHeight:1.4}}>
            <strong>Get the IncludeMe app</strong> for a faster, native experience with notifications
          </span>
        )}
        {isAndroid&&(
          <a href="https://play.google.com/store/apps/details?id=uk.includeme.app" target="_blank" rel="noopener noreferrer" style={{flexShrink:0,background:"rgba(255,255,255,0.18)",border:"1px solid rgba(255,255,255,0.4)",color:"#fff",fontWeight:700,fontSize:12,padding:"6px 12px",borderRadius:7,textDecoration:"none",whiteSpace:"nowrap"}}>
            Get it on Google Play
          </a>
        )}
        <button onClick={dismiss} aria-label="Dismiss" style={{flexShrink:0,background:"none",border:"none",color:"rgba(255,255,255,0.7)",fontSize:18,lineHeight:1,cursor:"pointer",padding:4}}>×</button>
      </div>
    </div>
  );
};

export default function App() {
  const [activities,setActivities]=useState([]);
  const [loadingData,setLoadingData]=useState(true);
  const [user,setUser]=useState(null);
  const isAdmin=!!(user&&user.email&&ADMIN_EMAILS.includes(user.email.toLowerCase()));
  const [sessionChecked,setSessionChecked]=useState(false);
  const [splashZooming,setSplashZooming]=useState(false);
  const [viewMode,setViewMode]=useState("list");
  const [sectionTab,setSectionTab]=useState("activities"); // activities | therapies | charities
  const [selected,setSelected]=useState(null);
  const [autoClaimId,setAutoClaimId]=useState(null); // set from ?id=X&claim=1 deep link (claim-invite email)
  const [reviewVersion,setReviewVersion]=useState(0);
  const [showAuth,setShowAuth]=useState(false);
  const [showResetPassword,setShowResetPassword]=useState(false); // set true when Supabase fires PASSWORD_RECOVERY (user clicked the email link)
  const [showForm,setShowForm]=useState(false);
  const [editTarget,setEditTarget]=useState(null);
  const [showDash,setShowDash]=useState(false);
  const [showSaved,setShowSaved]=useState(false);
  const [showAccount,setShowAccount]=useState(false);
  const [accountInitTab,setAccountInitTab]=useState("profile");
  const [upgradeConfirmation,setUpgradeConfirmation]=useState(null); // "verified" | "featured" | null — set after returning from a real Stripe payment
  const [showAdmin,setShowAdmin]=useState(false);
  const [showNotifs,setShowNotifs]=useState(false);
  const [showSuggest,setShowSuggest]=useState(false);
  const [showLocOnboard,setShowLocOnboard]=useState(false);
  const [showNotifSub,setShowNotifSub]=useState(false);
  const [showPlanner,setShowPlanner]=useState(false);
  const [enquiryAct,setEnquiryAct]=useState(null);
  const [upgradeAct,setUpgradeAct]=useState(null);
  const [verifyAct,setVerifyAct]=useState(null);
  const [search,setSearch]=useState("");
  const [typeFilter,setTypeFilter]=useState("All Types");
  const [therapyCategoryFilter,setTherapyCategoryFilter]=useState("All");
  const [needsFilter,setNeedsFilter]=useState([]);
  const [ageFilter,setAgeFilter]=useState("");
  const [freeOnly,setFreeOnly]=useState(false);
  const [fundingFilter,setFundingFilter]=useState([]);
  const [supportFilter,setSupportFilter]=useState([]);
  const [verifiedOnly,setVerifiedOnly]=useState(false);
  const [accessFilter,setAccessFilter]=useState([]);
  const [showFilters,setShowFilters]=useState(false);
  const [daysFilter,setDaysFilter]=useState([]);
  const [weekendOnly,setWeekendOnly]=useState(false);
  const [holidayOnly,setHolidayOnly]=useState(false);
  const [userLoc,setUserLoc]=useState(null);
  const [locInput,setLocInput]=useState("");
  const [locLabel,setLocLabel]=useState("");
  const [locating,setLocating]=useState(false);
  const [locError,setLocError]=useState("");
  const [distRadius,setDistRadius]=useState(null);

  useEffect(()=>{
    // Show SEED immediately — no waiting for Supabase
    setActivities(SEED);
    setLoadingData(false);
    // Handle deep link right away
    const params=new URLSearchParams(window.location.search);
    const deepId=params.get("id");
    if(deepId){const found=SEED.find(a=>a.id===deepId);if(found){setSelected(found);
      // ?id=X&claim=1 (from a claim-invite email) opens the listing AND flags
      // the claim flow to auto-open, so providers land one tap from claiming.
      if(params.get("claim")==="1")setAutoClaimId(deepId);
    }}
    // Returning from Stripe Checkout after a real payment (success_url in
    // create-checkout-session.js). The webhook (stripe-webhook.js) typically
    // activates the listing within a second or two — well before this page
    // finishes loading — but we don't rely on that timing: opening "My
    // Listings" is correct either way, and the badge will simply appear the
    // moment the webhook lands if there's any delay.
    const upgradedTier=params.get("upgraded");
    if(upgradedTier){
      setAccountInitTab("listings");setShowAccount(true);setUpgradeConfirmation(upgradedTier);
      window.history.replaceState({},"",window.location.pathname);
    }
    if(params.get("upgradeCancelled")){
      window.history.replaceState({},"",window.location.pathname);
    }
    // Fallback for password recovery: Supabase fires PASSWORD_RECOVERY via
    // onAuthStateChange, but that event can fire before React's useEffect has
    // registered the listener (Supabase initialises at module level). Checking
    // the URL hash directly on mount is the reliable safety net — the hash
    // contains `type=recovery` when the user lands from a reset email link.
    if(window.location.hash.includes("type=recovery")){
      setShowResetPassword(true);
      window.history.replaceState({},"",window.location.pathname+window.location.search);
    }
    // Register for native app push (no-ops in the browser / before Firebase set up)
    registerNativePush(null,null,"");
    // Fetch Supabase overrides in background — merge without blocking render
    (async()=>{
      try{
        const overrideKeys=await store.list("activity:");
        if(!overrideKeys.length)return;
        const overrides=await Promise.all(overrideKeys.map(k=>store.get(k)));
        const overrideMap={};
        for(const act of overrides.filter(Boolean))overrideMap[act.id]=act;
        const merged=SEED.map(s=>overrideMap[s.id]?{...s,...overrideMap[s.id]}:s);
        const userCreated=overrides.filter(a=>a&&!SEED.find(s=>s.id===a.id));
        const loaded=[...merged,...userCreated.filter(Boolean)];
        setActivities(loaded);
        if(deepId){const found=loaded.find(a=>a.id===deepId);if(found)setSelected(found);}
      }catch{/* keep SEED */}
    })();
  },[]);

  // ── Fix: users constantly getting logged out on the native app ──
  // Supabase's autoRefreshToken relies on a running JS timer to proactively
  // renew the session before it expires (~every 55 min). Native apps get
  // backgrounded far more aggressively than a browser tab — the OS
  // suspends JS timers to save battery — so that timer simply doesn't fire
  // while the app is in the background. Someone leaves the app running,
  // comes back an hour later, and the token silently expired with no
  // refresh ever attempted: they appear logged out despite never having
  // signed out, and since notification preferences/FCM token registration
  // also depend on a valid session, this was very likely breaking
  // notifications too, not just the visible login state.
  //
  // Fix (Supabase's own documented pattern for exactly this scenario):
  // explicitly stop the refresh timer while hidden/backgrounded, and
  // restart it — plus force an immediate session check — the moment the
  // app becomes visible again, rather than waiting for the timer to
  // eventually catch up on its own.
  useEffect(()=>{
    const handleVisibility=()=>{
      if(document.visibilityState==="visible"){
        sb.auth.startAutoRefresh();
        sb.auth.getSession().catch(()=>{});
      }else{
        sb.auth.stopAutoRefresh();
      }
    };
    document.addEventListener("visibilitychange",handleVisibility);
    // Also cover the moment the app first loads while already visible
    if(document.visibilityState==="visible")sb.auth.startAutoRefresh();
    return()=>document.removeEventListener("visibilitychange",handleVisibility);
  },[]);

  useEffect(()=>{
    // Race getSession against a 4s timeout so Supabase issues never hang the app
    const sessionFetch=Promise.race([
      sb.auth.getSession(),
      new Promise(res=>setTimeout(()=>res({data:{session:null}}),4000))
    ]);
    const minDelay=new Promise(res=>setTimeout(res,3000));
    const zoomTimer=setTimeout(()=>setSplashZooming(true),2500);
    (async()=>{
      try{
        const {data:{session}}=await sessionFetch;
        await minDelay;
        if(session?.user){try{setUser(await ensureProfile(session.user));}catch{}}
      }catch{}
      setSessionChecked(true);
    })();
    const {data:sub}=sb.auth.onAuthStateChange(async(event,session)=>{
      if(session?.user){try{setUser(await ensureProfile(session.user));}catch{}}
      else{setUser(null);}
      // Clicking the "reset password" link in the email lands here with a
      // temporary recovery session. Without this check, that session looked
      // identical to a normal sign-in — the person would land straight in
      // the app with their OLD password still unchanged, no indication
      // anything needed to happen, which is exactly why this "didn't seem
      // to work." Now it shows a dedicated screen to actually set a new one.
      if(event==="PASSWORD_RECOVERY")setShowResetPassword(true);
    });
    return()=>{clearTimeout(zoomTimer);sub.subscription.unsubscribe();};
  },[]);

  const handleAuth=async u=>{
    setUser(u);setShowAuth(false);setSessionChecked(true);
    // Business owners with an existing listing land straight on "My Listings"
    // so the Featured/Verified upgrade options are the first thing they see —
    // not buried behind extra navigation.
    if(u.accountType==="business"&&activities.some(a=>a.ownerId===u.id)){
      setAccountInitTab("listings");setShowAccount(true);
    }
  };
  const handleLogout=async()=>{await auth.signOut();setUser(null);};
  const handleSaveActivity=act=>{setActivities(prev=>{const e=prev.find(a=>a.id===act.id);return e?prev.map(a=>a.id===act.id?act:a):[...prev,act];});setShowForm(false);setEditTarget(null);};
  // Activate Featured immediately (called after a successful payment). A real Stripe
  // charge would run before this; on success it flips the listing live at once.
  const handleActivateFeatured=async act=>{
    const updated=await activateTier(act,"featured");
    setActivities(prev=>prev.map(a=>a.id===act.id?updated:a));
    return updated;
  };
  const handleActivateVerified=async act=>{
    const updated=await activateTier(act,"verified");
    setActivities(prev=>prev.map(a=>a.id===act.id?updated:a));
    return updated;
  };
  const handleDelete=async id=>{if(!confirm("Delete this listing? This cannot be undone."))return;await store.del(`activity:${id}`);setActivities(prev=>prev.filter(a=>a.id!==id));};
  const handleFav=async id=>{if(!user){setShowAuth(true);return;}const favs=user.favourites||[];const adding=!favs.includes(id);const next=adding?[...favs,id]:favs.filter(f=>f!==id);const updated={...user,favourites:next};setUser(updated);try{await saveProfile({favourites:next});}catch{}
    if(adding){
      const todayKey=new Date().toISOString().slice(0,10);
      store.get(`saves:${id}`).then(v=>{
        const count=((v?.count)||0)+1;
        store.set(`saves:${id}`,{count});
        return store.get(`saves_history:${id}`);
      }).then(sh=>{
        const hist=sh?.days||{};hist[todayKey]=(hist[todayKey]||0)+1;
        store.set(`saves_history:${id}`,{days:hist});
      }).catch(()=>{});
    }
  };
  const handleUpdateUser=u=>{
    setUser(u);
    if(u&&u.savedLoc&&!userLoc){
      setUserLoc(u.savedLoc);
      setLocLabel(u.savedLocLabel||"Your location");
    }
  };
  useEffect(()=>{
    if(user&&user.accountType==="individual"&&!userLoc&&!user.savedLoc){
      const timer=setTimeout(()=>setShowLocOnboard(true),1200);
      return function(){ clearTimeout(timer); };
    }
  },[user]);
  const handleLocOnboardSet=async(loc,label)=>{
    setUserLoc(loc);
    setLocLabel(label||"Your location");
    setShowLocOnboard(false);
    // Persist to profile so it auto-loads next session
    if(user){
      const u={...user,savedLoc:loc,savedLocLabel:label||"Your location"};
      setUser(u);
      saveProfile({savedLoc:loc,savedLocLabel:label||"Your location"}).catch(()=>{});
    }
    // Small delay then prompt to subscribe to alerts if they haven't yet
    if(user&&!user.notifSub){
      setTimeout(()=>setShowNotifSub(true),800);
    }
  };
  const handleNotifSubSave=async(sub)=>{
    if(user){const u={...user,notifSub:sub};setUser(u);saveProfile({notifSub:sub}).catch(()=>{});}
  };
  useEffect(()=>{
    const pushHandler=()=>setShowNotifSub(true);
    document.addEventListener("includeme:showPushModal",pushHandler);
    return function(){
      document.removeEventListener("includeme:showPushModal",pushHandler);
    };
  },[]);
  const notifList=useMemo(()=>(user&&user.accountType==="individual")?buildNotifs(activities,user,userLoc):[],[activities,user,userLoc]);
  const unreadNotifs=notifList.filter(n=>String(n.ts||"")>String(user?.lastNotifSeen||"")).length;
  const openNotifs=()=>{setShowNotifs(true);if(user){const u={...user,lastNotifSeen:new Date().toISOString()};setUser(u);saveProfile({lastNotifSeen:u.lastNotifSeen}).catch(()=>{});}};
  const clearAllNotifs=()=>{if(!user)return;const ids=notifList.map(n=>n.id);const u={...user,dismissedNotifs:[...new Set([...(user.dismissedNotifs||[]),...ids])].slice(-300)};setUser(u);saveProfile({dismissedNotifs:u.dismissedNotifs}).catch(()=>{});};
  const clearOneNotif=(id)=>{if(!user)return;const u={...user,dismissedNotifs:[...new Set([...(user.dismissedNotifs||[]),id])].slice(-300)};setUser(u);saveProfile({dismissedNotifs:u.dismissedNotifs}).catch(()=>{});};
  const openListingById=id=>{const a=activities.find(x=>x.id===id);if(a)setSelected(a);};
  // In-app messaging: replies from providers, previously saved server-side
  // via send-reply.js but never actually read back or shown anywhere in the
  // app — a family only ever found out via email/push, with no in-app
  // record. This fetches replies:{user.id} directly (that key/write path is
  // already correct, confirmed via direct database check).
  const [messages,setMessages]=useState([]);
  const [showMessages,setShowMessages]=useState(false);
  useEffect(()=>{
    if(!user){setMessages([]);return;}
    let cancelled=false;
    store.get(`replies:${user.id}`).then(v=>{if(!cancelled)setMessages(Array.isArray(v)?v:[]);}).catch(()=>{if(!cancelled)setMessages([]);});
    return()=>{cancelled=true;};
  },[user&&user.id]);
  const unreadMessages=messages.filter(m=>!m.read).length;
  const markMessageRead=(id)=>{
    if(!user)return;
    const updated=messages.map(m=>m.id===id?{...m,read:true}:m);
    setMessages(updated);
    store.set(`replies:${user.id}`,updated).catch(()=>{});
  };
  // Business accounts: fetch enquiry count at App level too (not just inside
  // ListingsPanel) so a prominent banner can show on the main screen without
  // requiring the provider to first dig into My Listings to discover they
  // have unread enquiries waiting.
  const [businessEnquiries,setBusinessEnquiries]=useState([]);
  const [accountOpenEnquiries,setAccountOpenEnquiries]=useState(false);
  useEffect(()=>{
    if(!user||user.accountType!=="business"){setBusinessEnquiries([]);return;}
    let cancelled=false;
    store.get(`enquiries:${user.id}`).then(v=>{if(!cancelled)setBusinessEnquiries(Array.isArray(v)?v:[]);}).catch(()=>{if(!cancelled)setBusinessEnquiries([]);});
    return()=>{cancelled=true;};
  },[user&&user.id]);
  const unreadBusinessEnquiries=businessEnquiries.filter(e=>!e.read).length;
  const openEnquiriesPanel=()=>{setAccountInitTab("listings");setAccountOpenEnquiries(true);setShowAccount(true);};
  const handleLoadPreset=f=>{
    if(f.type!==undefined)setTypeFilter(f.type||"All Types");
    if(f.needs!==undefined)setNeedsFilter(f.needs||[]);
    if(f.age!==undefined)setAgeFilter(f.age||"");
    if(f.freeOnly!==undefined)setFreeOnly(!!f.freeOnly);
    if(f.verifiedOnly!==undefined)setVerifiedOnly(!!f.verifiedOnly);
    if(f.access!==undefined)setAccessFilter(f.access||[]);
    if(f.days!==undefined)setDaysFilter(f.days||[]);
    if(f.weekendOnly!==undefined)setWeekendOnly(!!f.weekendOnly);
    if(f.holidayOnly!==undefined)setHolidayOnly(!!f.holidayOnly);
    if(f.distRadius!==undefined)setDistRadius(f.distRadius||null);
  };

  const geocodeLocation=()=>{
    const raw=locInput.trim();if(!raw)return;
    const formatted=looksLikePostcode(raw)?formatPostcode(raw):raw;
    if(formatted!==raw)setLocInput(formatted);
    setLocError("");
    const result=resolveLocation(formatted);
    if(result){setUserLoc({lat:result.lat,lng:result.lng});setLocLabel(result.label);}
    else setLocError("Location not found. Try a UK town (e.g. Leeds) or postcode (e.g. GU22 9HP).");
  };

  const toggleChip=(arr,setter,val)=>setter(prev=>prev.includes(val)?prev.filter(x=>x!==val):[...prev,val]);
  const activeFilters=[typeFilter!=="All Types"?typeFilter:null,...needsFilter,ageFilter,freeOnly?"f":null,verifiedOnly?"v":null,...accessFilter,...fundingFilter,...supportFilter,...daysFilter,weekendOnly?"we":null,holidayOnly?"hol":null,(userLoc&&distRadius)?`${distRadius}mi`:null,userLoc?"loc":null].filter(Boolean).length;
  const currentFilters={type:typeFilter,needs:needsFilter,age:ageFilter,freeOnly,verifiedOnly,access:accessFilter,days:daysFilter,weekendOnly,holidayOnly,distRadius,locLabel};

  const activitiesWithDist=useMemo(()=>activities.map(a=>({...a,dist:(userLoc&&a.lat&&a.lng)?haversine(userLoc.lat,userLoc.lng,a.lat,a.lng):null})),[activities,userLoc]);

  const filtered=useMemo(()=>{
    // Charities are usually national — families don't care how near one is — so the
    // charities tab ignores location entirely (no distance filter, sort, or band).
    const locActive=userLoc;
    const base=activitiesWithDist.filter(a=>{
    if(sectionTab==="therapies"&&a.category!=="therapy")return false;
    if(sectionTab==="charities"&&a.category!=="charity")return false;
    if(fundingFilter.length>0&&!fundingFilter.every(f=>(a.funding||[]).includes(f)))return false;
    if(supportFilter.length>0){const tags=charitySupportTags(a);if(!supportFilter.every(sf=>tags.includes(sf)))return false;}
    if(sectionTab==="activities"&&(a.category==="therapy"||a.category==="charity"))return false;
    if(sectionTab==="therapies"&&therapyCategoryFilter!=="All"){
      const tc=THERAPY_CATEGORIES.find(c=>c.id===therapyCategoryFilter);
      if(tc&&!tc.keywords.some(kw=>(a.name+" "+(a.description||"")+" "+(a.type||"")).toLowerCase().includes(kw.toLowerCase())))return false;
    }
    if(search&&![a.name,a.organisation,a.description].some(s=>s.toLowerCase().includes(search.toLowerCase())))return false;
    if(typeFilter!=="All Types"&&a.type!==typeFilter)return false;
    if(needsFilter.length&&!needsFilter.some(n=>a.needs.includes(n)))return false;
    if(ageFilter&&(parseInt(ageFilter)<a.ageMin||parseInt(ageFilter)>a.ageMax))return false;
    if(freeOnly&&a.cost?.toLowerCase()!=="free")return false;
    if(verifiedOnly&&!a.verified)return false;
    if(accessFilter.length&&!accessFilter.every(ac=>(a.accessibility||a.access||[]).includes(ac)))return false;
    if(daysFilter.length&&!daysFilter.some(d=>(a.days||[]).includes(d)))return false;
    if(weekendOnly&&!(a.days||[]).some(d=>["Saturday","Sunday"].includes(d)))return false;
    if(holidayOnly&&!isHolidayClub(a))return false;
    if(locActive){const cap=distRadius||1609;if(a.dist==null)return false;if(a.dist>cap*1.60934)return false;}
    return true;
    }).sort((a,b)=>{
      // Base order is by distance (nearest first) when location applies; otherwise
      // (e.g. charities, or no location) keep natural order. Featured placement is
      // applied separately below so it can be capped and kept locally relevant.
      if(locActive&&a.dist!=null&&b.dist!=null)return a.dist-b.dist;
      if(locActive&&a.dist!=null)return -1;
      if(locActive&&b.dist!=null)return 1;
      return 0;
    });

    // ── Featured placement ──────────────────────────────────────────────────────
    // Featured is a positional good, and this is a directory for families of
    // disabled children, so paid listings must never dominate the page. Two rules:
    //   1. Featured earns dedicated TOP slots only when a location is set — its
    //      promise is "priority near families in your area", which needs an area.
    //      Those slots are capped and rotate daily so every paying provider in the
    //      area gets time in the spotlight.
    //   2. Everywhere else (including with no location set), featured listings are
    //      spaced out — at most one per FEATURED_GAP cards — so the feed is always
    //      a fair mix and never a wall of gold. They keep their badge regardless.
    const FEATURED_BAND=4;             // nearby featured shown above standard results
    const FEATURED_BOOST_RADIUS_MI=25; // a band slot must be this near the family
    const FEATURED_GAP=4;              // min non-featured cards between any overflow featured

    // Rule 1 — the rotating priority BAND. When a location is set, nearby featured
    // listings sit above all standard results, capped at FEATURED_BAND and rotated
    // daily so every paying provider in the area gets fair time near the top.
    const boosted=[];
    if(locActive){
      const eligible=base.filter(a=>a.featured&&a.dist!=null&&a.dist<=FEATURED_BOOST_RADIUS_MI*1.60934);
      if(eligible.length){
        const start=Math.floor(Date.now()/86400000)%eligible.length; // changes daily
        for(let k=0;k<Math.min(FEATURED_BAND,eligible.length);k++)boosted.push(eligible[(start+k)%eligible.length]);
      }
    }
    const boostedIds=new Set(boosted.map(a=>a.id));

    // Rule 2 — any overflow featured (5th+ nearby, or all featured when no location
    // is set) are woven through the standard results, spaced by FEATURED_GAP so they
    // never bunch into a wall of gold. They keep their badge. Non-featured keep their
    // natural order; leftovers go to the end.
    const restFeatured=base.filter(a=>a.featured&&!boostedIds.has(a.id));
    const restOther=base.filter(a=>!a.featured&&!boostedIds.has(a.id));
    const woven=[];let fi=0;
    for(let i=0;i<restOther.length;i++){
      woven.push(restOther[i]);
      if((i+1)%FEATURED_GAP===0&&fi<restFeatured.length)woven.push(restFeatured[fi++]);
    }
    while(fi<restFeatured.length)woven.push(restFeatured[fi++]);
    let result=[...boosted,...woven];

    // Owner self-view — a logged-in provider always sees ALL their own listings
    // pinned to the very top (labelled "Your listing"), so they can always find and
    // check them instantly regardless of where rotation placed them for families.
    if(user&&user.id){
      const owned=result.filter(a=>a.ownerId===user.id);
      if(owned.length){
        const ownedIds=new Set(owned.map(a=>a.id));
        result=[...owned.map(a=>({...a,_ownerPinned:true})),...result.filter(a=>!ownedIds.has(a.id))];
      }
    }
    return result;
  },[activitiesWithDist,search,typeFilter,therapyCategoryFilter,needsFilter,ageFilter,freeOnly,fundingFilter,supportFilter,verifiedOnly,accessFilter,daysFilter,weekendOnly,holidayOnly,distRadius,userLoc,sectionTab,user]);

  const clearFilters=()=>{setSearch("");setTypeFilter("All Types");setTherapyCategoryFilter("All");setNeedsFilter([]);setAgeFilter("");setFreeOnly(false);setFundingFilter([]);setSupportFilter([]);setVerifiedOnly(false);setAccessFilter([]);setDaysFilter([]);setWeekendOnly(false);setHolidayOnly(false);setUserLoc(null);setLocLabel("");setLocInput("");setLocError("");setDistRadius(null);};
  const selectedDist=selected&&userLoc&&selected.lat?haversine(userLoc.lat,userLoc.lng,selected.lat,selected.lng):null;

  // Loading screen
  if(!sessionChecked)return(
    <div style={{minHeight:"100vh",background:C.brand,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:F.body,flexDirection:"column",overflow:"hidden",position:"relative"}}>
      <GlobalStyles/>
      <style>{`
        @keyframes spinY   { from{transform:rotateY(0deg)} to{transform:rotateY(360deg)} }
        @keyframes pulse   { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.85;transform:scale(0.97)} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }

        /* Logo sinks away as the iris opens */
        @keyframes logoSink {
          0%   { transform:scale(1);   opacity:1; }
          40%  { transform:scale(0.88);opacity:0.6; }
          100% { transform:scale(0.7); opacity:0; }
        }
        /* Text fades and lifts */
        @keyframes textFade { to { opacity:0; transform:translateY(-10px); } }

        /* White iris expands from the logo centre */
        @keyframes irisOpen {
          0%   { clip-path: circle(8%  at 50% 42%); }
          100% { clip-path: circle(180% at 50% 42%); }
        }
      `}</style>

      {/* White iris overlay — appears on zoom trigger */}
      {splashZooming&&(
        <div style={{
          position:"absolute",inset:0,zIndex:10,
          background:"#F7F6F2",
          animation:"irisOpen 0.55s cubic-bezier(0.4,0,0.15,1) forwards",
        }}/>
      )}

      {/* Logo */}
      <div style={{
        marginBottom:36,
        animation: splashZooming
          ? "logoSink 0.55s ease forwards"
          : "pulse 2.4s ease-in-out infinite",
        position:"relative", zIndex:5,
      }}>
        <div style={{
          width:130, height:130, borderRadius:36,
          background:"white",
          boxShadow:"0 32px 80px rgba(0,0,0,0.25), 0 8px 24px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.9)",
          display:"flex", alignItems:"center", justifyContent:"center",
          animation: splashZooming ? "none" : "spinY 2.8s ease-in-out infinite",
          transformStyle:"preserve-3d",
        }}>
          <svg width="72" height="72" viewBox="0 0 36 36" fill="none">
            <circle cx="11" cy="8" r="4" fill={C.brand}/>
            <circle cx="25" cy="8" r="4" fill={C.brandMd}/>
            <path d="M4 28v-3a7 7 0 0 1 7-7h0a7 7 0 0 1 7 7v3" stroke={C.brand} strokeWidth="2.2" strokeLinecap="round"/>
            <path d="M18 28v-3a7 7 0 0 1 7-7h0a7 7 0 0 1 7 7v3" stroke={C.brandMd} strokeWidth="2.2" strokeLinecap="round"/>
            <path d="M18 12.5c0-1.5 2-3 3.5-1.5s0 4-3.5 6c-3.5-2-5-4.5-3.5-6S18 11 18 12.5z" fill={C.accent}/>
          </svg>
        </div>
      </div>

      {/* Wordmark */}
      <div style={{
        animation: splashZooming ? "textFade 0.25s ease forwards" : "fadeUp 0.7s ease both",
        animationDelay: splashZooming ? "0s" : "0.2s",
        textAlign:"center", position:"relative", zIndex:5,
      }}>
        <div style={{fontSize:38,fontWeight:600,color:"white",fontFamily:F.display,letterSpacing:"-0.01em",lineHeight:1,marginBottom:8}}>IncludeMe</div>
        <div style={{fontSize:12,color:"rgba(255,255,255,0.55)",letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:500}}>SEND Activity Finder</div>
      </div>
    </div>
  );

  // Landing page
  if(!user)return(
    <div style={{minHeight:"100vh",fontFamily:F.body,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden",background:C.hero}}>
      <GlobalStyles/>

      {/* ── Faded activity cards in background ── */}
      <div style={{position:"absolute",inset:0,overflow:"hidden",pointerEvents:"none",zIndex:0}}>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(180deg, rgba(246,244,238,0.0) 0%, rgba(246,244,238,0.7) 40%, rgba(246,244,238,0.95) 75%, rgba(246,244,238,1) 100%)",zIndex:2}}/>
        <div style={{position:"absolute",inset:0,display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,padding:16,opacity:0.22,filter:"blur(1px)",transform:"scale(1.04)",zIndex:1}}>
          {[
            {name:"Sensory Swim",org:"AquaAbility CIC",type:"Swimming",col:"#E7F0F4",c:"#1C5C76",icon:"🏊"},
            {name:"Creative Arts Club",org:"Rainbow Arts",type:"Arts & Crafts",col:"#F6E9EE",c:"#9A3458",icon:"🎨"},
            {name:"Pony Pals Riding",org:"Green Meadow",type:"Animal Therapy",col:"#E6EFE7",c:"#2C6B45",icon:"🐴"},
            {name:"Drumbeat Music",org:"Sound Minds",type:"Music",col:"#EDEAF3",c:"#5A4A8A",icon:"🎵"},
            {name:"Sensory Play",org:"Little Stars CIC",type:"Sensory",col:"#EFE9F2",c:"#6A3D82",icon:"✨"},
            {name:"Football Inclusion",org:"All Abilities FC",type:"Sports",col:"#F5ECDD",c:"#92591F",icon:"⚽"},
            {name:"Inclusive Drama",org:"Peer Productions",type:"Drama",col:"#F6E8E8",c:"#9A3A41",icon:"🎭"},
            {name:"Challengers Play",org:"Disability Challengers",type:"Social Skills",col:"#E4EFEB",c:"#1F6B57",icon:"🤝"},
            {name:"Nature Explorers",org:"CET Nature Trust",type:"Nature",col:"#E6EFE3",c:"#3D6B2C",icon:"🌿"},
          ].map((a,i)=>(
            <div key={i} style={{background:"white",borderRadius:16,padding:16,border:`1px solid ${C.slate200}`,boxShadow:"0 2px 8px rgba(40,33,22,0.05)"}}>
              <div style={{display:"flex",gap:8,marginBottom:10,alignItems:"center"}}>
                <span style={{background:a.col,color:a.c,padding:"3px 10px",borderRadius:7,fontSize:11,fontWeight:700}}>{a.icon} {a.type}</span>
              </div>
              <div style={{fontWeight:600,fontSize:15,color:C.slate900,marginBottom:2,fontFamily:F.display}}>{a.name}</div>
              <div style={{fontSize:11,color:C.slate400}}>{a.org}</div>
              <div style={{marginTop:10,display:"flex",gap:4}}>
                {["Autism","SEND","Sensory"].map(t=><span key={t} style={{background:C.brandLt,color:C.brand,borderRadius:7,padding:"2px 8px",fontSize:10,fontWeight:600}}>{t}</span>)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Centred brand + auth ── */}
      <div style={{position:"relative",zIndex:3,display:"flex",flexDirection:"column",alignItems:"center",padding:"0 20px",width:"100%"}}>

        {/* Symbol */}
        <div style={{marginBottom:16,display:"flex",flexDirection:"column",alignItems:"center"}}>
          <div style={{width:72,height:72,borderRadius:20,background:`linear-gradient(135deg,${C.brand} 0%,${C.brandMd} 100%)`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 8px 28px ${C.brand}35`,marginBottom:14}}>
            {/* Hands/embrace icon — more symbolic, unique */}
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Two figures reaching toward each other */}
              <circle cx="11" cy="8" r="4" fill="white"/>
              <circle cx="25" cy="8" r="4" fill="rgba(255,255,255,0.65)"/>
              <path d="M4 28v-3a7 7 0 0 1 7-7h0a7 7 0 0 1 7 7v3" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
              <path d="M18 28v-3a7 7 0 0 1 7-7h0a7 7 0 0 1 7 7v3" stroke="rgba(255,255,255,0.65)" strokeWidth="2.2" strokeLinecap="round"/>
              {/* Heart spark between them */}
              <path d="M18 12.5c0-1.5 2-3 3.5-1.5s0 4-3.5 6c-3.5-2-5-4.5-3.5-6S18 11 18 12.5z" fill="#FDE68A"/>
            </svg>
          </div>

          {/* Wordmark */}
          <div style={{fontSize:40,fontWeight:600,color:C.slate900,fontFamily:F.display,letterSpacing:"-0.015em",lineHeight:1,marginBottom:6}}>IncludeMe</div>
          {/* Tagline banner */}
          <div style={{background:C.brand,borderRadius:99,padding:"4px 16px",display:"inline-flex",alignItems:"center",gap:6}}>
            <span style={{fontSize:12,fontWeight:600,color:"white",letterSpacing:"0.04em"}}>SEND &amp; Disability Activity Finder</span>
          </div>
        </div>

        {/* Subtitle */}
        <p style={{color:C.slate500,fontSize:14,margin:"0 0 28px",maxWidth:320,lineHeight:1.6,textAlign:"center"}}>
          Discover inclusive activities for children with special needs across the UK
        </p>

        {/* Auth card */}
        <LandingAuthCard onAuth={handleAuth}/>

        <p style={{color:C.slate400,fontSize:11,marginTop:20,letterSpacing:"0.06em",textTransform:"uppercase"}}>Free to use · No ads · Built with care</p>
      </div>
    </div>
  );

  return(
    <div style={{minHeight:"100vh",background:sectionTab==="therapies"?C.therBg:sectionTab==="charities"?C.charBg:C.actBg,fontFamily:F.body,transition:"background 0.4s ease"}}>
      <GlobalStyles/>
      <InstallBanner/>

      {/* ── Header ── */}
      <header style={{position:"sticky",top:0,zIndex:100,boxShadow:"0 1px 0 rgba(40,33,22,0.06), 0 6px 24px rgba(40,33,22,0.06)"}}>
        <style>{`
          .hdr-tabs{scrollbar-width:none;-webkit-overflow-scrolling:touch;}
          .hdr-tabs::-webkit-scrollbar{display:none;}
          .hdr-tab{position:relative;flex:0 0 auto;padding:9px 16px;background:rgba(255,255,255,0.1);color:#b0dcd1;font:600 13.5px/1 'Inter',system-ui,sans-serif;border:none;border-radius:10px 10px 0 0;white-space:nowrap;text-decoration:none;cursor:pointer;transition:background .15s,color .15s;}
          .hdr-tab:hover{background:rgba(255,255,255,0.18);color:#fff;}
          .hdr-tab.on{background:#fff;color:#0A5044;font-weight:800;}
          @media(max-width:600px){
            .hdr-tabs{padding-left:10px!important;padding-right:10px!important;-webkit-mask-image:linear-gradient(to right,#000 90%,transparent);mask-image:linear-gradient(to right,#000 90%,transparent);}
            .hdr-tab{flex:1 1 0;text-align:center;padding:10px 6px;font-size:13.5px;}
            .hdr-tabs{gap:5px!important;-webkit-mask-image:none!important;mask-image:none!important;}
            .apps-strip-lbl{display:none!important;}
              .hdr-tagline{display:none!important;}
            .hdr-saved .hdr-lbl{display:none!important;}
            .leaflet-pane,.leaflet-top,.leaflet-bottom,.leaflet-control{z-index:1!important;}
            .leaflet-container{z-index:0!important;position:relative!important;}
            .hdr-add span{display:none!important;}
            .hdr-add{padding:6px 10px!important;}
            .hdr-alerts-lbl{display:none!important;}
            .hdr-alerts-btn{padding:6px 9px!important;}
            .hdr-right-group{gap:6px!important;}
            .hdr-ic{width:36px!important;height:36px!important;min-width:36px!important;padding:0!important;border-radius:50%!important;justify-content:center!important;gap:0!important;flex-shrink:0!important;position:relative!important;}
            .hdr-ic .hdr-badge{position:absolute!important;top:-4px!important;right:-4px!important;box-shadow:0 0 0 2px #0F6B5C;}
            .hdr-saved .hdr-lbl,.hdr-alerts-lbl{display:none!important;}
            .hdr-bar-inner{padding-left:10px!important;padding-right:10px!important;}
          }
          @media(max-width:360px){
            .hdr-wordmark{font-size:16px!important;}
            .hdr-logo{display:none!important;}
            .hdr-ic{width:34px!important;height:34px!important;min-width:34px!important;}
            .hdr-right-group{gap:5px!important;}
          }
        `}</style>
        {/* Row 1: Brand bar */}
        {/* paddingTop uses env(safe-area-inset-top) so the header sits below
            the status bar/notch instead of underneath it. Android 15
            (API 35, required by Google Play as of the targetSdkVersion bump)
            enforces edge-to-edge display by default, meaning content now
            renders behind system bars unless explicitly padded for — the
            bottom nav already accounted for this via safe-area-inset-bottom,
            but the header never had the equivalent top padding, which is
            why the header buttons became unclickable on real devices. */}
        <div style={{background:C.brandDk,paddingTop:"env(safe-area-inset-top)"}}>
          <div className="hdr-bar-inner" style={{maxWidth:1080,margin:"0 auto",padding:"0 16px",display:"flex",alignItems:"center",justifyContent:"space-between",height:54}}>
            <div style={{display:"flex",alignItems:"center",gap:10,minWidth:0}}>
              <div className="hdr-logo" style={{width:30,height:30,borderRadius:9,background:"rgba(255,255,255,0.14)",border:"1px solid rgba(255,255,255,0.22)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <svg width="17" height="17" viewBox="0 0 36 36" fill="none">
                  <circle cx="11" cy="8" r="4" fill="white"/>
                  <circle cx="25" cy="8" r="4" fill="rgba(255,255,255,0.55)"/>
                  <path d="M4 28v-3a7 7 0 0 1 7-7h0a7 7 0 0 1 7 7v3" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                  <path d="M18 28v-3a7 7 0 0 1 7-7h0a7 7 0 0 1 7 7v3" stroke="rgba(255,255,255,0.55)" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="hdr-wordmark" style={{fontSize:19,fontWeight:600,color:"white",fontFamily:F.display,letterSpacing:"-0.01em",whiteSpace:"nowrap"}}>IncludeMe</span>
              <span className="hdr-tagline" style={{fontSize:10,color:"rgba(255,255,255,0.55)",fontWeight:600,letterSpacing:"0.14em",textTransform:"uppercase",marginLeft:3,borderLeft:"1px solid rgba(255,255,255,0.2)",paddingLeft:11}}>SEND Finder</span>
            </div>
            <div className="hdr-right-group" style={{display:"flex",alignItems:"center",gap:7,flexShrink:0}}>
              {user.accountType==="individual"&&<HeaderMenu alerts={unreadNotifs+unreadMessages} saved={(user.favourites||[]).length} name={user.name&&!user.name.includes("@")?user.name:user.email} onAlerts={openNotifs} onSaved={()=>setShowSaved(true)} onAccount={()=>setShowAccount(true)} onAdmin={()=>setShowAdmin(true)} isAdmin={isAdmin}/>}
              {user&&user.accountType!=="individual"&&(
                <button className="hdr-ic" onClick={()=>setShowMessages(true)} title="Messages" style={{position:"relative",display:"flex",alignItems:"center",gap:5,padding:"6px 11px",borderRadius:9,border:`1px solid ${unreadMessages>0?"#93C5FD":"rgba(255,255,255,0.2)"}`,background:unreadMessages>0?"rgba(59,130,246,0.22)":"rgba(255,255,255,0.1)",color:"white",fontWeight:600,fontSize:12,cursor:"pointer",fontFamily:F.body}}>
                  <span style={{fontSize:14,lineHeight:0}}>💬</span>
                  {unreadMessages>0&&<span className="hdr-badge" style={{minWidth:16,height:16,padding:"0 4px",borderRadius:99,background:"#3B82F6",color:"#fff",fontSize:10,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center"}}>{unreadMessages>9?"9+":unreadMessages}</span>}
                </button>
              )}
              {user&&user.accountType==="business"&&(
                <button className="hdr-add" onClick={()=>setShowForm(true)} style={{display:"flex",alignItems:"center",gap:5,padding:"6px 12px",borderRadius:9,border:"none",background:C.accent,color:"white",fontWeight:600,fontSize:12,cursor:"pointer",fontFamily:F.body,boxShadow:"0 4px 12px rgba(221,98,64,0.35)"}}>
                  <Icons.plus/><span>Add listing</span>
                </button>
              )}
              {user.accountType!=="individual"&&(<>
              <button className="hdr-ic" onClick={()=>setShowAccount(true)} style={{width:32,height:32,borderRadius:"50%",background:"rgba(255,255,255,0.16)",border:"1.5px solid rgba(255,255,255,0.3)",color:"white",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:F.display,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                {(user.name&&!user.name.includes("@")?user.name:user.email)[0].toUpperCase()}
              </button>
              {/* Admin cog — visible only to exact-match admin accounts */}
              {isAdmin&&(
                <button onClick={()=>setShowAdmin(true)} title="Admin panel" style={{width:32,height:32,borderRadius:"50%",background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.2)",color:"rgba(255,255,255,0.7)",fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  ⚙️
                </button>
              )}
              </>)}
            </div>
          </div>
          {user.accountType==="individual"&&<AppsDrawer/>}
          {/* App tabs live in the header, scrollable on phones. The last two open our other tools in a new tab. */}
          <div className="hdr-tabs" style={{maxWidth:1080,margin:"0 auto",padding:"2px 16px 0",display:"flex",gap:6,overflowX:"auto"}}>
            {[["activities","Activities"],["therapies","Therapies"],["charities","Charities"]].map(([id,label])=>(
              <button key={id} onClick={()=>setSectionTab(id)} className={"hdr-tab"+(sectionTab===id?" on":"")} aria-current={sectionTab===id?"page":undefined}>{label}</button>
            ))}
          </div>
        </div>

        {/* Row 2: Search + controls — MOVED to a fixed bottom bar (#1) */}
        <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:900,background:`linear-gradient(135deg,${C.brand} 0%,${C.brandMd} 100%)`,boxShadow:"0 -10px 30px rgba(40,33,22,0.28)"}}>
          <div style={{maxWidth:1080,margin:"0 auto",padding:"12px 16px",paddingBottom:"max(12px, env(safe-area-inset-bottom))",display:"flex",gap:8,alignItems:"center"}}>
            <div style={{flex:1,position:"relative"}}>
              <div style={{position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",color:C.brand,lineHeight:0,pointerEvents:"none"}}><Icons.search/></div>
              <input
                style={{width:"100%",padding:"11px 12px 11px 38px",border:"none",borderRadius:11,fontSize:14,outline:"none",boxSizing:"border-box",background:C.white,color:C.slate800,transition:"box-shadow 0.15s",fontFamily:F.body,boxShadow:"0 2px 8px rgba(0,0,0,0.18)"}}
                placeholder={sectionTab==="activities"?"Search activities, organisations…":sectionTab==="therapies"?"Search therapies, specialists…":"Search charities…"}
                value={search} onChange={e=>setSearch(e.target.value)}
                onFocus={e=>{e.target.style.boxShadow=`0 0 0 3px rgba(255,255,255,0.5)`;}}
                onBlur={e=>{e.target.style.boxShadow="0 2px 8px rgba(0,0,0,0.18)";}}
              />
            </div>
            <div style={{display:"flex",background:"rgba(255,255,255,0.15)",borderRadius:11,padding:3,flexShrink:0,border:"1px solid rgba(255,255,255,0.2)"}}>
              {[["list","List"],["map","Map"]].map(([v,lbl])=>(
                <button key={v} onClick={()=>setViewMode(v)} style={{padding:"8px 13px",borderRadius:8,border:"none",background:viewMode===v?C.white:"transparent",color:viewMode===v?C.brand:"rgba(255,255,255,0.85)",fontWeight:700,fontSize:12.5,cursor:"pointer",transition:"all 0.15s",fontFamily:F.body}}>
                  {lbl}
                </button>
              ))}
            </div>
            <button onClick={()=>setShowFilters(f=>!f)} style={{display:"flex",alignItems:"center",gap:6,padding:"10px 16px",borderRadius:11,border:"none",background:C.accent,color:"white",fontWeight:800,fontSize:13,cursor:"pointer",transition:"all 0.15s",flexShrink:0,fontFamily:F.body,boxShadow:"0 3px 12px rgba(0,0,0,0.25)"}}>
              <Icons.filter/>Filters{activeFilters>0&&<span style={{background:"rgba(255,255,255,0.32)",color:"white",borderRadius:99,padding:"1px 7px",fontSize:11,fontWeight:800}}>{activeFilters}</span>}
            </button>
          </div>
        </div>


      </header>

      {/* ── Unread enquiries banner — business accounts only ──
          Previously enquiries were only visible after digging into
          My Listings, easy to miss entirely. This surfaces them
          immediately on the main screen, impossible to overlook. */}
      {user&&user.accountType==="business"&&unreadBusinessEnquiries>0&&(
        <div style={{background:"linear-gradient(90deg,#0A5044,#0F6B5C)",cursor:"pointer"}} onClick={openEnquiriesPanel}>
          <div style={{maxWidth:1080,margin:"0 auto",padding:"13px 20px",display:"flex",alignItems:"center",gap:12}}>
            <span style={{fontSize:20,flexShrink:0}}>✉️</span>
            <span style={{flex:1,color:"#fff",fontWeight:700,fontSize:14}}>
              You have {unreadBusinessEnquiries} new enquir{unreadBusinessEnquiries!==1?"ies":"y"} from famil{unreadBusinessEnquiries!==1?"ies":"y"}
            </span>
            <span style={{background:"rgba(255,255,255,0.2)",border:"1px solid rgba(255,255,255,0.4)",color:"#fff",fontWeight:700,fontSize:12.5,padding:"7px 14px",borderRadius:8,flexShrink:0,whiteSpace:"nowrap"}}>
              View now →
            </span>
          </div>
        </div>
      )}

      {/* ── Filter Panel — context-aware per tab ── */}
      {showFilters&&
        <div style={{background:C.white,borderBottom:`1px solid ${C.slate100}`,boxShadow:SHADOW.sm}}>
          <div style={{maxWidth:960,margin:"0 auto",padding:"16px 20px"}}>

            {/* Location / distance — shown on all tabs, including charities */}
            {true&&
            <div style={{background:C.slate50,borderRadius:10,padding:16,marginBottom:18,border:`1px solid ${C.slate100}`}}>
              <Label>Location</Label>
              <div style={{display:"flex",gap:8,marginBottom:10}}>
                <div style={{flex:1}}>
                  <input value={locInput} onChange={e=>setLocInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&(geocodeLocation(),setShowFilters(false),setViewMode("list"))} placeholder="Town or postcode — e.g. GU22 9HP or Guildford" style={{...inputStyle}}/>
                </div>
                <Btn onClick={()=>{geocodeLocation();setShowFilters(false);setViewMode("list");}} disabled={!locInput.trim()} size="md">Search</Btn>
                {userLoc&&<Btn variant="ghost" onClick={()=>{setUserLoc(null);setLocLabel("");setLocInput("");setLocError("");setDistRadius(null);}}>Clear</Btn>}
              </div>
              {locError&&<div style={{background:"#FEF2F2",border:`1px solid #FECACA`,color:C.red,padding:"8px 12px",borderRadius:7,fontSize:12,marginBottom:8}}>⚠ {locError}</div>}
              {userLoc&&<div style={{background:"#F0FDF4",border:`1px solid #BBF7D0`,borderRadius:7,padding:"7px 12px",marginBottom:10,fontSize:12,fontWeight:600,color:C.green}}>Showing distances from {locLabel}</div>}
              {userLoc&&(
                <>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                    <span style={{fontSize:12,color:C.slate600,fontWeight:500}}>Search radius</span>
                    <span style={{fontSize:12,fontWeight:700,color:C.brand}}>{distRadius?`${distRadius} miles`:"All distances"}</span>
                  </div>
                  <input type="range" min={1} max={100} step={1} value={distRadius||50} onChange={e=>setDistRadius(parseInt(e.target.value))} style={{width:"100%",accentColor:C.brand,cursor:"pointer",marginBottom:10}}/>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    <Chip active={distRadius==null} onClick={()=>setDistRadius(null)}>All</Chip>
                    {[5,10,20,50,100].map(d=><Chip key={d} active={distRadius===d} onClick={()=>setDistRadius(d)}>{d} mi</Chip>)}
                  </div>
                </>
              )}
            </div>
            }

            {/* Needs — shown on all tabs */}
            <div style={{marginBottom:18}}>
              <Label>Condition / Need</Label>
              <ChipGroup items={NEEDS_LIST} selected={needsFilter} onToggle={v=>toggleChip(needsFilter,setNeedsFilter,v)}/>
            </div>

            {/* ACTIVITIES-specific filters */}
            {sectionTab==="activities"&&<>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:12,marginBottom:16}}>
                <Select label="Activity Type" options={ACTIVITY_TYPES} value={typeFilter} onChange={e=>setTypeFilter(e.target.value)}/>
                <Input label="Child's Age" type="number" placeholder="e.g. 8" value={ageFilter} onChange={e=>setAgeFilter(e.target.value)}/>
              </div>
              <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
                <Chip active={freeOnly} onClick={()=>setFreeOnly(v=>!v)}>Free only</Chip>
                <Chip active={verifiedOnly} onClick={()=>setVerifiedOnly(v=>!v)}>Verified only</Chip>
                <Chip active={weekendOnly} onClick={()=>{setWeekendOnly(v=>!v);if(!weekendOnly)setHolidayOnly(false);}}>Weekends</Chip>
                <Chip active={holidayOnly} onClick={()=>{setHolidayOnly(v=>!v);if(!holidayOnly)setWeekendOnly(false);}}>School holidays</Chip>
              </div>
              <div style={{marginBottom:18}}>
                <Label>Specific days</Label>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"].map(day=>{
                    const active=daysFilter.includes(day);
                    return(
                      <button key={day} onClick={()=>{setDaysFilter(prev=>prev.includes(day)?prev.filter(d=>d!==day):[...prev,day]);setWeekendOnly(false);setHolidayOnly(false);}}
                        style={{padding:"6px 14px",borderRadius:7,fontSize:12,fontWeight:500,border:`1.5px solid ${active?C.brand:C.slate200}`,background:active?C.brand:C.white,color:active?C.white:C.slate600,cursor:"pointer",transition:"all 0.12s",fontFamily:"inherit"}}>
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <Label>Accessibility Required</Label>
                <ChipGroup items={ACCESS_LIST} selected={accessFilter} onToggle={v=>toggleChip(accessFilter,setAccessFilter,v)} color={C.brand}/>
              </div>
            </>}

            {/* THERAPIES-specific filters */}
            {sectionTab==="therapies"&&<>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:12,marginBottom:12}}>
                <Select label="Therapy Type" options={["All Types","Aquatic / Hydrotherapy","Speech & Language","Occupational Therapy","Music Therapy","Art Therapy","Animal Therapy","Physiotherapy","Sensory Integration","Play Therapy"]} value={typeFilter} onChange={e=>setTypeFilter(e.target.value)}/>
                <Input label="Child's Age" type="number" placeholder="e.g. 8" value={ageFilter} onChange={e=>setAgeFilter(e.target.value)}/>
              </div>
              {/* Therapy category chips */}
              <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap"}}>
                {THERAPY_CATEGORIES.map(cat=>{
                  const active=therapyCategoryFilter===cat.id;
                  return(
                    <button key={cat.id} onClick={()=>setTherapyCategoryFilter(active?"All":cat.id)}
                      style={{padding:"5px 13px",borderRadius:20,border:`1.5px solid ${active?C.brand:C.slate200}`,background:active?C.brand:"white",color:active?"white":C.slate500,fontSize:12,fontWeight:active?700:500,cursor:"pointer",fontFamily:F.body,transition:"all 0.15s"}}>
                      {cat.label}
                    </button>
                  );
                })}
              </div>
              <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
                <Chip active={freeOnly} onClick={()=>setFreeOnly(v=>!v)}>NHS / Free</Chip>
                <Chip active={verifiedOnly} onClick={()=>setVerifiedOnly(v=>!v)}>Verified only</Chip>
              </div>
            </>}

            {/* CHARITIES-specific filters */}
            {sectionTab==="charities"&&<>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:12,marginBottom:16}}>
                <Input label="Child's Age" type="number" placeholder="e.g. 8" value={ageFilter} onChange={e=>setAgeFilter(e.target.value)}/>
              </div>
              <div style={{marginBottom:16}}>
                <Label>Funding & grants available</Label>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {FUNDING_OPTS.map(opt=>{
                    const active=fundingFilter.includes(opt);
                    return(
                      <button key={opt} onClick={()=>toggleChip(fundingFilter,setFundingFilter,opt)}
                        style={{padding:"6px 13px",borderRadius:20,border:`1.5px solid ${active?C.brand:C.slate200}`,background:active?C.brand:"white",color:active?"white":C.slate500,fontSize:12,fontWeight:active?700:500,cursor:"pointer",fontFamily:F.body,transition:"all 0.15s"}}>
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div style={{marginBottom:16}}>
                <Label>Type of support</Label>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {CHARITY_SUPPORT.map(s=>{
                    const active=supportFilter.includes(s.label);
                    return(
                      <button key={s.label} onClick={()=>toggleChip(supportFilter,setSupportFilter,s.label)}
                        style={{padding:"6px 13px",borderRadius:20,border:`1.5px solid ${active?C.brand:C.slate200}`,background:active?C.brand:"white",color:active?"white":C.slate500,fontSize:12,fontWeight:active?700:500,cursor:"pointer",fontFamily:F.body,transition:"all 0.15s"}}>
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
                <Chip active={freeOnly} onClick={()=>setFreeOnly(v=>!v)}>Free services</Chip>
                <Chip active={verifiedOnly} onClick={()=>setVerifiedOnly(v=>!v)}>Verified only</Chip>
              </div>
            </>}

          </div>
          {/* Apply button — bottom of filter panel */}
          <div style={{padding:"12px 20px 16px",borderTop:`1px solid ${C.slate100}`,display:"flex",justifyContent:"flex-end",gap:10}}>
            {activeFilters>0&&<button onClick={clearFilters} style={{padding:"9px 18px",borderRadius:9,border:`1px solid ${C.slate200}`,background:"none",color:C.slate400,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:F.body}}>Clear all</button>}
            <Btn onClick={()=>setShowFilters(false)}>Apply{activeFilters>0?` (${activeFilters} active)`:""} ✓</Btn>
          </div>
        </div>
      }

      {/* ── Quick type filter bar — activities ── */}
      {sectionTab==="activities"&&<div style={{maxWidth:1020,margin:"0 auto",padding:"12px 0 10px",background:"#fff",boxShadow:"0 0 0 100vmax #fff",clipPath:"inset(0 -100vmax)"}}>
        <div style={{display:"flex",gap:6,overflowX:"auto",padding:"0 24px 6px",scrollbarWidth:"none"}}>
          <style>{`.qf-bar::-webkit-scrollbar{display:none}`}</style>
          <button onClick={()=>setTypeFilter("All Types")} style={{flexShrink:0,padding:"6px 16px",borderRadius:6,border:`1px solid ${typeFilter==="All Types"?C.brand:C.slate200}`,background:typeFilter==="All Types"?C.brand:C.white,color:typeFilter==="All Types"?C.white:C.slate600,fontSize:12,fontWeight:typeFilter==="All Types"?600:400,cursor:"pointer",transition:"all 0.15s",whiteSpace:"nowrap"}}>All</button>
          <button onClick={()=>{setHolidayOnly(v=>!v);if(!holidayOnly)setWeekendOnly(false);}} style={{flexShrink:0,display:"flex",alignItems:"center",gap:5,padding:"5px 14px",borderRadius:6,border:`1px solid ${holidayOnly?"#6D28D9":C.slate200}`,background:holidayOnly?"#6D28D9":C.white,color:holidayOnly?C.white:"#6D28D9",fontSize:12,fontWeight:holidayOnly?600:500,cursor:"pointer",transition:"all 0.15s",whiteSpace:"nowrap"}}>🏖️ Holiday Clubs</button>
          {Object.entries(typeConfig).filter(([type])=>activitiesWithDist.some(a=>a.type===type)).map(([type,tc])=>{
            const active=typeFilter===type;
            return(<button key={type} onClick={()=>setTypeFilter(active?"All Types":type)} style={{flexShrink:0,padding:"5px 14px",borderRadius:6,border:`1px solid ${active?tc.col:C.slate200}`,background:active?tc.bg:C.white,color:active?tc.col:C.slate500,fontSize:12,fontWeight:active?600:400,cursor:"pointer",transition:"all 0.15s",whiteSpace:"nowrap"}}>{type}</button>);
          })}
        </div>
      </div>}

      {/* ── Quick category filter bar — therapies (#6) ── */}
      {sectionTab==="therapies"&&<div style={{maxWidth:1020,margin:"0 auto",padding:"12px 0 10px",background:"#fff",boxShadow:"0 0 0 100vmax #fff",clipPath:"inset(0 -100vmax)"}}>
        <div style={{display:"flex",gap:6,overflowX:"auto",padding:"0 24px 6px",scrollbarWidth:"none"}}>
          <button onClick={()=>setTherapyCategoryFilter("All")} style={{flexShrink:0,padding:"6px 16px",borderRadius:6,border:`1px solid ${therapyCategoryFilter==="All"?C.brand:C.slate200}`,background:therapyCategoryFilter==="All"?C.brand:C.white,color:therapyCategoryFilter==="All"?C.white:C.slate600,fontSize:12,fontWeight:therapyCategoryFilter==="All"?600:400,cursor:"pointer",transition:"all 0.15s",whiteSpace:"nowrap"}}>All</button>
          {THERAPY_CATEGORIES.filter(cat=>cat.id!=="All").map(cat=>{
            const active=therapyCategoryFilter===cat.id;
            return(<button key={cat.id} onClick={()=>setTherapyCategoryFilter(active?"All":cat.id)} style={{flexShrink:0,padding:"5px 14px",borderRadius:6,border:`1px solid ${active?C.brand:C.slate200}`,background:active?C.brand:C.white,color:active?C.white:C.slate500,fontSize:12,fontWeight:active?600:400,cursor:"pointer",transition:"all 0.15s",whiteSpace:"nowrap"}}>{cat.label}</button>);
          })}
        </div>
      </div>}

      {/* ── Quick filter bar — charities (type of support) ── */}
      {sectionTab==="charities"&&<div style={{maxWidth:1020,margin:"0 auto",padding:"12px 0 10px",background:"#fff",boxShadow:"0 0 0 100vmax #fff",clipPath:"inset(0 -100vmax)"}}>
        <div style={{display:"flex",gap:6,overflowX:"auto",padding:"0 24px 6px",scrollbarWidth:"none"}}>
          <button onClick={()=>setSupportFilter([])} style={{flexShrink:0,padding:"6px 16px",borderRadius:6,border:`1px solid ${supportFilter.length===0?C.brand:C.slate200}`,background:supportFilter.length===0?C.brand:C.white,color:supportFilter.length===0?C.white:C.slate600,fontSize:12,fontWeight:supportFilter.length===0?600:400,cursor:"pointer",transition:"all 0.15s",whiteSpace:"nowrap"}}>All</button>
          {CHARITY_SUPPORT.map(s=>{
            const active=supportFilter.includes(s.label);
            return(<button key={s.label} onClick={()=>toggleChip(supportFilter,setSupportFilter,s.label)} style={{flexShrink:0,padding:"5px 14px",borderRadius:6,border:`1px solid ${active?C.brand:C.slate200}`,background:active?C.brand:C.white,color:active?C.white:C.slate500,fontSize:12,fontWeight:active?600:400,cursor:"pointer",transition:"all 0.15s",whiteSpace:"nowrap"}}>{s.label}</button>);
          })}
        </div>
      </div>}

      {/* ── Results bar ── */}
      <div style={{maxWidth:960,margin:"0 auto",padding:"8px 20px 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <p style={{margin:0,fontSize:13,color:C.slate400,fontWeight:500}}>
          {loadingData?"Loading…":`${filtered.length} ${filtered.length===1?(sectionTab==="therapies"?"therapy":sectionTab==="charities"?"charity":"activity"):(sectionTab==="therapies"?"therapies":sectionTab==="charities"?"charities":"activities")}`}
          {weekendOnly&&<span style={{color:C.brand}}> · weekends</span>}
          {holidayOnly&&<span style={{color:C.brand}}> · school holidays</span>}
          {daysFilter.length>0&&<span style={{color:C.brand}}> · {daysFilter.map(d=>d.slice(0,3)).join(", ")}</span>}
          {userLoc&&distRadius&&<span style={{color:C.brand}}> within {distRadius} mi of {locLabel}</span>}
          {userLoc&&!distRadius&&<span style={{color:C.brand}}> · sorted by distance from {locLabel}</span>}
        </p>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          {activeFilters>0&&<span style={{fontSize:12,color:C.brand,fontWeight:600}}>{activeFilters} filter{activeFilters>1?"s":""} applied</span>}
          {activeFilters>0&&<button onClick={clearFilters} style={{background:"none",border:"none",color:C.slate400,fontSize:12,fontWeight:500,cursor:"pointer",fontFamily:F.body}}>Clear</button>}
          {activeFilters>0&&user&&<button onClick={()=>setShowAccount(true)} style={{background:"none",border:"none",color:C.brand,fontSize:12,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:4,fontFamily:F.body}}><Icons.save/>Save</button>}
        </div>
      </div>

      {/* ── Location prompt (show when no location set) — not on charities ── */}
      {!userLoc&&sectionTab!=="charities"&&(
        <div style={{maxWidth:960,margin:"12px auto 0",padding:"0 20px"}}>
          <div style={{background:C.white,borderRadius:12,padding:"13px 16px",border:`1px solid ${C.slate200}`,boxShadow:"0 2px 10px rgba(40,33,22,0.06)",display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
            <span style={{fontSize:14}}>📍</span>
            <span style={{fontSize:13.5,fontWeight:600,color:C.slate700,flex:1,minWidth:120}}>Find {sectionTab==="therapies"?"therapies":sectionTab==="charities"?"charities":"activities"} near you</span>
            <div style={{display:"flex",gap:8,alignItems:"center",flex:"1 1 220px"}}>
              <input value={locInput} onChange={e=>setLocInput(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&geocodeLocation()}
                placeholder="Enter town or postcode…"
                style={{...inputStyle,marginBottom:0,flex:1,fontSize:13,padding:"8px 12px"}}/>
              <Btn size="sm" onClick={geocodeLocation}>Search</Btn>
              <button onClick={()=>setShowFilters(f=>!f)} style={{display:"flex",alignItems:"center",gap:5,padding:"8px 13px",borderRadius:9,border:`1.5px solid ${showFilters?C.brand:C.slate200}`,background:showFilters?C.brand:C.white,color:showFilters?"white":C.slate600,fontWeight:600,fontSize:12,cursor:"pointer",flexShrink:0,fontFamily:F.body,whiteSpace:"nowrap"}}>
                <Icons.filter/> Filters{activeFilters>0?` (${activeFilters})`:""}
              </button>
            </div>
          </div>
        </div>
      )}
      {userLoc&&sectionTab!=="charities"&&(
        <div style={{maxWidth:960,margin:"12px auto 0",padding:"0 20px"}}>
          <div style={{background:C.brandLt,borderRadius:10,padding:"10px 16px",border:`1px solid rgba(15,107,92,0.2)`,display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
            <span style={{fontSize:13}}>📍</span>
            <span style={{fontSize:13,fontWeight:600,color:C.brand,flex:1}}>Showing {sectionTab==="therapies"?"therapies":sectionTab==="charities"?"charities":"activities"} near {locLabel}</span>
            <button onClick={()=>setShowFilters(f=>!f)} style={{display:"flex",alignItems:"center",gap:5,padding:"7px 12px",borderRadius:8,border:`1.5px solid ${showFilters?"rgba(15,107,92,0.6)":"rgba(15,107,92,0.3)"}`,background:showFilters?"#0F6B5C":"rgba(15,107,92,0.08)",color:showFilters?"white":C.brand,fontWeight:600,fontSize:12,cursor:"pointer",flexShrink:0,fontFamily:F.body}}>
              <Icons.filter/> Filters{activeFilters>0?` (${activeFilters})`:""}
            </button>
            <button onClick={()=>{setUserLoc(null);setLocLabel("");setLocInput("");setDistRadius(null);}} style={{background:"none",border:"none",cursor:"pointer",color:C.slate400,fontSize:12,fontFamily:F.body,padding:0}}>Change</button>
          </div>
        </div>
      )}

      {sectionTab==="activities"&&(user&&user.accountType==="business"||!user)&&(
        <div style={{maxWidth:960,margin:"10px auto 0",padding:"0 20px"}}>
          {user?.accountType==="business"?(
            <div style={{background:"linear-gradient(135deg,#0A5044,#0F6B5C)",borderRadius:12,padding:"14px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,boxShadow:"0 6px 18px rgba(15,107,92,0.25)"}}>
              <div>
                <div style={{fontWeight:700,fontSize:14,color:"#fff",marginBottom:2}}>➕ Add your activity or service</div>
                <div style={{fontSize:12,color:"rgba(255,255,255,0.78)"}}>List free so local families can find you — add photos, holiday clubs and availability.</div>
              </div>
              <button onClick={()=>setShowForm(true)}
                style={{flexShrink:0,padding:"9px 18px",borderRadius:9,border:"none",background:"#fff",color:C.brand,fontWeight:700,fontSize:13,cursor:"pointer",whiteSpace:"nowrap",boxShadow:"0 2px 8px rgba(0,0,0,0.15)"}}>
                Add listing →
              </button>
            </div>
          ):(
            <div style={{background:"linear-gradient(135deg,#0A5044,#0F6B5C)",borderRadius:12,padding:"12px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
              <div>
                <div style={{fontWeight:700,fontSize:13,color:"#fff",marginBottom:2}}>Run a SEND activity or therapy?</div>
                <div style={{fontSize:12,color:"rgba(255,255,255,0.7)"}}>List your service free — or upgrade to Featured for priority placement near local families.</div>
              </div>
              <button onClick={()=>setShowAuth(true)}
                style={{flexShrink:0,padding:"8px 16px",borderRadius:9,border:"1.5px solid rgba(255,255,255,0.35)",background:"rgba(255,255,255,0.12)",color:"white",fontWeight:700,fontSize:12,cursor:"pointer",whiteSpace:"nowrap"}}>
                Sign up free →
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── List view ── */}
      {viewMode==="list"&&(
        <div style={{maxWidth:960,margin:"10px auto 110px",padding:"0 20px"}}>
          {/* ── Event banner (#7) — swipeable, only events within the user's search area ── */}
          {sectionTab==="activities"&&(()=>{
            const R=(distRadius||40)*1.60934;
            const inArea=EVENTS.filter(e=>!userLoc||(e.lat!=null&&haversine(userLoc.lat,userLoc.lng,e.lat,e.lng)<=R));
            return (PROMO_REPLACES_EVENTS&&user&&user.accountType==="individual")?<MoreFromCarousel/>:<EventCarousel events={inArea}/>;
          })()}
          {/* ── Holiday banner (#4) — only within 30 days of a school holiday ── */}
          {sectionTab==="activities"&&(()=>{
            const nh=nextHoliday();const within=nh&&nh.days<=30;
            const n=activities.filter(a=>a.category!=="charity"&&upcomingSessions(a).length).length;
            if(!within&&!holidayOnly)return null;
            return(
            <div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap",background:"linear-gradient(135deg,#6D28D9,#7C3AED)",borderRadius:12,padding:"12px 16px",marginBottom:14,boxShadow:"0 6px 18px rgba(109,40,217,0.25)"}}>
              <span style={{fontSize:20}}>☀️</span>
              <div style={{flex:1,minWidth:150}}>
                <div style={{color:"#fff",fontWeight:700,fontSize:14}}>{within?`${nh.name} ${nh.days===0?"start today":`start in ${nh.days} days`}`:(holidayOnly?"Showing holiday clubs":"Holiday clubs")}</div>
                <div style={{color:"rgba(255,255,255,0.82)",fontSize:12}}>{n} dated club{n!==1?"s":""}{userLoc?" near you":""} · book early</div>
              </div>
              <button onClick={()=>{setHolidayOnly(v=>!v);if(!holidayOnly)setWeekendOnly(false);}} style={{flexShrink:0,background:"#fff",color:"#6D28D9",border:"none",borderRadius:8,padding:"7px 14px",fontSize:12.5,fontWeight:700,cursor:"pointer",fontFamily:F.body}}>{holidayOnly?"Show all":"View clubs"}</button>
              {user&&user.accountType==="individual"&&<button onClick={()=>setShowPlanner(true)} style={{flexShrink:0,background:"rgba(255,255,255,0.2)",color:"#fff",border:"1px solid rgba(255,255,255,0.4)",borderRadius:8,padding:"7px 12px",fontSize:12.5,fontWeight:700,cursor:"pointer",fontFamily:F.body}}>🗓️ Plan</button>}
              {user&&user.accountType==="individual"&&<button onClick={()=>setShowSuggest(true)} style={{flexShrink:0,background:"rgba(255,255,255,0.15)",color:"#fff",border:"1px solid rgba(255,255,255,0.35)",borderRadius:8,padding:"7px 12px",fontSize:12.5,fontWeight:600,cursor:"pointer",fontFamily:F.body}}>Suggest a club</button>}
            </div>
            );})()}
          {loadingData?<div style={{textAlign:"center",padding:"60px",color:C.slate300,fontWeight:500}}>Loading activities…</div>
          :filtered.length===0?<div style={{textAlign:"center",padding:"60px 20px",background:C.white,borderRadius:12,border:`1px solid ${C.slate100}`}}>
            <div style={{fontSize:40,marginBottom:12}}>🔍</div>
            <h3 style={{color:C.slate700,marginBottom:6,fontFamily:F.display,fontWeight:700}}>No activities found</h3>
            <p style={{color:C.slate400,fontSize:13}}>Try adjusting your filters{distRadius?" or increasing the search radius":""}.</p>
            {user&&user.accountType==="individual"&&<button onClick={()=>setShowSuggest(true)} style={{marginTop:14,background:C.brandLt,color:C.brand,border:"none",borderRadius:9,padding:"9px 16px",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:F.body}}>Know a club we're missing? Suggest it →</button>}
          </div>
          :<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:14}}>
            {(()=>{
              const cards=filtered.map(a=><ActivityCard key={a.id} act={a} dist={a.dist} onOpen={setSelected} onFav={handleFav} isFav={(user?.favourites||[]).includes(a.id)} isOwner={user&&a.ownerId===user.id} onEdit={act=>{setEditTarget(act);setShowForm(true);}} onDelete={handleDelete} onUpgrade={setUpgradeAct} onVerify={setVerifyAct} reviewVersion={reviewVersion}/>);
              // For families, drop a prominent "Suggest an activity" card in among the listings
              if(user&&user.accountType==="individual"&&cards.length>=3){
                const pos=Math.min(3+(filtered.length%4),cards.length);
                cards.splice(pos,0,(
                  <button key="suggest-card" onClick={()=>setShowSuggest(true)} style={{display:"flex",flexDirection:"column",alignItems:"flex-start",justifyContent:"center",gap:8,minHeight:180,background:"linear-gradient(135deg,#0F6B5C,#2E8C7B)",border:"none",borderRadius:16,padding:"22px",cursor:"pointer",fontFamily:F.body,textAlign:"left",boxShadow:"0 6px 18px rgba(15,107,92,0.25)"}}>
                    <span style={{fontSize:30}}>➕</span>
                    <span style={{color:"#fff",fontWeight:700,fontSize:16,fontFamily:F.display}}>Know an activity we're missing?</span>
                    <span style={{color:"rgba(255,255,255,0.85)",fontSize:13,lineHeight:1.5}}>Help other families — suggest a club, group or activity and we'll add it.</span>
                    <span style={{marginTop:4,background:"#fff",color:C.brand,borderRadius:8,padding:"8px 16px",fontSize:13,fontWeight:700}}>Suggest an activity →</span>
                  </button>
                ));
              }
              if(!PROMO_REPLACES_EVENTS&&user&&user.accountType==="individual"&&cards.length>=3){
                cards.splice(Math.min(2,cards.length),0,<PromoCard key="promo-ehcp" kind="ehcp"/>);
                if(cards.length>=7)cards.splice(Math.min(6,cards.length),0,<PromoCard key="promo-pp" kind="pp"/>);
              }
              return cards;
            })()}
          </div>}
        </div>
      )}

      {/* ── Map view ── */}
      {viewMode==="map"&&(
        <div style={{maxWidth:960,margin:"10px auto 110px",padding:"0 20px"}}>
          {!userLoc&&<div style={{background:"#FFFBEB",border:`1px solid #FDE68A`,borderRadius:10,padding:"12px 16px",marginBottom:14,display:"flex",gap:10,alignItems:"center"}}>
            <span style={{fontSize:18}}>💡</span>
            <div><div style={{fontWeight:600,color:C.amber,fontSize:13}}>Set a location for the best experience</div><div style={{fontSize:12,color:"#92400E",marginTop:1}}>Open Filters and enter a postcode or town to see distances on the map.</div></div>
          </div>}
          <MapView activities={filtered} userLoc={userLoc} distRadius={distRadius} onOpen={setSelected} onFav={handleFav} favIds={(user?.favourites||[])}/>
        </div>
      )}

      {/* ── Modals ── */}
      {selected&&<DetailModal act={selected} dist={selectedDist} onClose={()=>{setSelected(null);setAutoClaimId(null);}} user={user} onReviewChange={()=>setReviewVersion(v=>v+1)} onEnquire={setEnquiryAct} onRequireAuth={()=>setShowAuth(true)} autoClaim={autoClaimId===selected.id}/>}
      {enquiryAct&&user&&<EnquiryModal act={enquiryAct} user={user} onClose={()=>setEnquiryAct(null)}/>}
      {showAuth&&<AuthModal onClose={()=>setShowAuth(false)} onAuth={handleAuth}/>}
      {showResetPassword&&<SetNewPasswordModal onClose={()=>setShowResetPassword(false)}/>}
      {showForm&&<ActivityForm onClose={()=>{setShowForm(false);setEditTarget(null);}} onSave={handleSaveActivity} initial={editTarget} user={user}/>}
      {showDash&&<Dashboard user={user} activities={activities} onEdit={act=>{setShowDash(false);setEditTarget(act);setShowForm(true);}} onDelete={handleDelete} onAdd={()=>setShowForm(true)} onClose={()=>setShowDash(false)}/>}
      {showSaved&&<SavedModal user={user} activities={activities} userLoc={userLoc} onOpen={setSelected} onFav={handleFav} onClose={()=>setShowSaved(false)}/>}
      {showMessages&&<MessagesModal messages={messages} onMarkRead={markMessageRead} onOpen={openListingById} onClose={()=>setShowMessages(false)} activities={activities} user={user}/>}
      {showPlanner&&user&&<HolidayPlannerModal user={user} activities={activities} userLoc={userLoc} onClose={()=>setShowPlanner(false)}/>}
      {showNotifs&&<NotificationsModal items={notifList} onOpen={openListingById} onClose={()=>setShowNotifs(false)} onClear={clearAllNotifs} onClearOne={clearOneNotif} unreadMessages={unreadMessages} onMessages={()=>{setShowNotifs(false);setShowMessages(true);}} onPlanner={()=>{setShowNotifs(false);setAccountInitTab("planner");setShowAccount(true);}}/>}
      {showSuggest&&<SuggestClubModal user={user} onClose={()=>setShowSuggest(false)}/>}
      {showLocOnboard&&<LocationOnboardModal onSet={handleLocOnboardSet} onSkip={()=>setShowLocOnboard(false)}/>}
      {showNotifSub&&<NotifSubModal user={user} userLoc={userLoc} locLabel={locLabel} onSave={handleNotifSubSave} onClose={()=>setShowNotifSub(false)}/>}
      {showAccount&&user&&<AccountModal user={user} onClose={()=>{setShowAccount(false);setAccountInitTab("profile");setUpgradeConfirmation(null);setAccountOpenEnquiries(false);}} onUpdateUser={handleUpdateUser} onLogout={()=>{handleLogout();setShowAccount(false);}} currentFilters={currentFilters} onLoadPreset={handleLoadPreset} myListings={activities.filter(a=>a.ownerId===user.id)} onEditListing={act=>{setShowAccount(false);setEditTarget(act);setShowForm(true);}} onDeleteListing={handleDelete} onActivateListing={handleActivateFeatured} onActivateVerifiedListing={handleActivateVerified} activities={activities} userLoc={userLoc} initialTab={accountInitTab} upgradeConfirmation={upgradeConfirmation} initialShowEnquiries={accountOpenEnquiries}/>}
      {upgradeAct&&user&&<FeaturedUpgradeModal act={upgradeAct} user={user} onActivated={handleActivateFeatured} onEdit={act=>{setUpgradeAct(null);setEditTarget(act);setShowForm(true);}} onClose={()=>setUpgradeAct(null)}/>}
      {verifyAct&&user&&<GetVerifiedModal act={verifyAct} user={user} onActivated={handleActivateVerified} onClose={()=>setVerifyAct(null)}/>}
      {showAdmin&&isAdmin&&<AdminPanel activities={activities} setActivities={setActivities} onClose={()=>setShowAdmin(false)}/>}
    </div>
  );
}
