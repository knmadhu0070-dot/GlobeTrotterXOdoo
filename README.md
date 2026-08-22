# GlobeTrotterXOdoo
participated in odoo hackathon.

🌍 GlobeTrotter

A smart, collaborative travel planning platform designed to make trip planning, discovery, budgeting, and on-trip exploration easier.

📌 Project Status

GlobeTrotter is a working hackathon MVP. The current version focuses on a stable end-to-end trip-planning foundation, while the sections below describe the larger product vision.

✅ Implemented in the current MVP

User authentication

Signup

Login

Existing-session handling

Logout

Forgot-password flow

Dashboard

Personalized welcome section

Upcoming trip section

Trip inspiration section

Trip creation

Trip name

Start/end dates

Description/notes

Budget

My Trips

View saved trips

Open trips

Delete trips

Trip Builder

Add multiple cities

City arrival/departure dates

City notes

Prevention of overlapping city dates

Delete cities

Activities

Multiple activities on the same day

Activity date and time

Location

Notes

Estimated cost

Delete activities

Trip editing

Trip name

Dates

Description

Budget

Explore/inspiration UI foundation

Persistent relational database

Cleaned-up responsive frontend styling

Core business rules and validation

🎯 Product Vision

The long-term goal is to make GlobeTrotter much more than an itinerary creator.

Your trip should not end when the itinerary is created. GlobeTrotter should help you before, during, and after the journey.

The full vision is a travel ecosystem where people can plan trips, discover places, manage budgets, collaborate, share experiences, and receive intelligent recommendations while travelling.

🗺️ 1. Map-Based Trip Planning

When adding a city, users should eventually be able to select and explore the destination directly on an interactive map.

Possible features:

Interactive maps

City and place markers

Route visualization

Distance between locations

Estimated travel time

Estimated transportation cost

Walking, public transport, taxi, car, train and flight options

Example:

Jaipur → Jodhpur

Distance: ~330 km
Estimated travel time: ~5h 30m

Train: ₹500–₹1,200
Bus: ₹400–₹900
Cab: ₹4,000–₹6,000

This would make the itinerary geographically meaningful rather than simply storing city names and dates.

🔎 2. Real Explore & Travel Community

The Explore section should eventually contain real public trips created by users instead of static inspiration cards.

Users should be able to search by:

City

Country

Trip name

Destination

Hashtags

Interests

Budget

Duration

For example:

Search: #budgetgoa

could find public trips where that hashtag appears in the creator's notes.

The idea is that one user's trip can help another traveller plan their own trip.

❤️ 3. Wishlist / Waiting List

Users should not have to copy an entire trip just because they like one place.

Similar to a shopping-app wishlist, users could save:

Cities

Monuments

Restaurants

Cafés

Activities

Public trips

Individual places from someone else's trip

Later:

Wishlist
   ↓
Select places
   ↓
Add selected places to my trip

This separates inspiration from the user's actual itinerary.

👥 4. Collaborative Group Trips

GlobeTrotter should support trips planned by multiple people.

A trip owner could invite friends and family to collaborate.

Possible roles:

Owner
  → Full control

Editor
  → Can modify the itinerary

Viewer
  → Can only view

Collaborators could:

Add cities

Suggest activities

Add places

Add notes

Vote on activities

Discuss options

Rearrange the itinerary

This would make GlobeTrotter useful for family trips, friend groups, college trips and team travel.

🤖 5. AI Travel Assistant

The long-term AI vision is not simply a chatbot that answers generic travel questions.

The AI should understand:

Current location

Remaining time

Existing itinerary

Budget

User interests

Opening hours

Travel time

Weather

Nearby places

Example:

"I have three hours free in Jaipur."

GlobeTrotter could suggest:

You have 3 hours free.

🏛️ City Palace
Travel: 20 min
Visit: ~1.5 hours
Estimated cost: ₹300

☕ Nearby café
Travel: 8 min
Estimated cost: ₹250

You can return before your next activity.

📍 6. Context-Aware Recommendations

While travelling, GlobeTrotter should become a real-time companion.

For example, if a user is currently at Mehrangarh Fort and has two hours before the next activity, the app could recommend:

Nearby attractions

Peaceful places

Restaurants

Cafés

Budget-friendly options

Hidden gems

Example:

You are near Mehrangarh Fort.

You have 2 hours free.

🌿 Rao Jodha Desert Rock Park
15 min away
₹100

☕ Nearby café
8 min away
₹250–₹400

The recommendation should consider the user's actual remaining time rather than showing a generic tourist list.

🏛️ 7. Intelligent Place Guide

GlobeTrotter should also act as a personal guide when the user is visiting a location.

For example:

📍 Mehrangarh Fort

What you're looking at:
[Information]

🎧 Listen

The guide could explain:

History

Architecture

Important rooms

Museum exhibits

Artifacts

Local stories

Cultural significance

What not to miss

The content could adapt to user interests.

A history-and-architecture enthusiast could receive deeper historical and architectural information, while an art-and-museum enthusiast could receive more detail about paintings, artifacts and collections.

🍛 8. Food & Restaurant Discovery

Near a destination, GlobeTrotter could recommend:

Local food

Famous restaurants

Cafés

Street food

Budget-friendly places

Fine dining

Local specialties

Filters could include:

Budget

Cuisine

Distance

Rating

Vegetarian/non-vegetarian

Local specialties

💰 9. Place-Level Estimated Costs

When adding a place, GlobeTrotter should estimate the likely cost.

For example:

Goa

🏖️ Baga Beach
Entry: Free
Food: ₹200–₹600

🏰 Aguada Fort
Entry: ₹40
Food nearby: ₹200–₹500

🌊 Water Sports
Estimated: ₹800–₹2,500

The user could see:

Estimated without food: ₹1,200
Estimated including food: ₹2,000

This would make trip budgets much more realistic.

📊 10. Intelligent Budget Planning

Instead of showing only one total budget:

Budget: ₹40,000

GlobeTrotter could provide:

Accommodation     ₹16,000
Transportation     ₹8,000
Activities         ₹5,500
Food               ₹7,000
Miscellaneous      ₹1,500
--------------------------------
Estimated total   ₹38,000

Remaining          ₹2,000

It could also warn users when their plan is over budget and suggest cheaper alternatives.

🧠 11. Personalized Recommendations

The app could learn travel preferences such as:

Adventure

History

Nature

Food

Museums

Photography

Nightlife

Peaceful places

Budget travel

Luxury travel

Recommendations would then become increasingly personalized.

🛣️ 12. Itinerary Optimization

GlobeTrotter could identify inefficient routes.

For example:

Mehrangarh Fort
      ↓
Restaurant 14 km away
      ↓
Another attraction 18 km back

The system could suggest a better order and show the estimated travel time saved.

🌦️ 13. Real-Time Travel Intelligence

With external APIs, GlobeTrotter could eventually consider:

Weather

Traffic

Opening hours

Public transport

Flight/train information

Temporary closures

Local events

For example:

Heavy rain is expected at 4 PM. Consider moving your outdoor activity to 11 AM.

🔗 14. Public Trip Sharing

Users should be able to choose:

Private
Friends
Public

Public trips could receive shareable URLs.

Other travellers could:

View the itinerary

Save individual places

Add places to their wishlist

Use the trip for inspiration

Follow the creator

React or comment

The goal is to turn travel experiences into reusable community knowledge.

🗃️ 15. Data Architecture

The current MVP already uses persistent relational storage.

The long-term data model can grow around:

Users
  │
  ├── Trips
  │     ├── Cities
  │     │     └── Activities
  │     ├── Expenses
  │     └── Wishlist
  │
  ├── Public Trips
  │
  └── Collaborations

External location, map, weather and activity data can be integrated through APIs while user-created travel data remains in our own database.

🛡️ 16. Privacy & Permissions

Users should have control over:

Private trips

Public trips

Collaborative trips

Profile visibility

Shared links

Account data

Collaborative trips should also use clear permissions so users cannot accidentally modify data they do not own.

🚀 17. Additional Future Possibilities

With enough time, GlobeTrotter could also support:

Offline itinerary access

Downloadable trip guides

Voice-based travel assistant

Multi-language guides

Currency conversion

Travel document storage

Packing-list generation

Emergency information

Local event discovery

Travel journals

Trip photo albums

Post-trip reviews

Travel statistics

Smart packing suggestions

Group expense splitting

AI-generated daily plans

Personalized travel recommendations

🏗️ Current Architecture

Frontend
React + Vite
      │
      ↓
Backend
Flask + SQLAlchemy
      │
      ↓
SQLite Database

The current database stores the core entities required by the MVP, including users, trips, cities/stops and activities.

🛠️ Technology Stack

Frontend

React

Vite

JavaScript

CSS

Lucide React

Backend

Python

Flask

SQLAlchemy

Database

SQLite for the current MVP

Future production direction

PostgreSQL

Maps/location APIs

Places/activity APIs

Weather APIs

AI/LLM services

Cloud storage

📈 Completed vs Future Vision

Current Hackathon MVP

Authentication              ✅
Trip creation               ✅
Trip editing                ✅
Trip deletion               ✅
Multi-city trips            ✅
City date validation        ✅
Multiple activities/day     ✅
Activity costs              ✅
Trip budgets                ✅
Dashboard                   ✅
My Trips                    ✅
Trip Builder                ✅
Explore foundation          ✅
Persistent database         ✅
Core business rules         ✅

Planned / Future Features

Interactive maps            🚧
Route/time/cost estimation  🚧
Real public trip discovery  🚧
Hashtag search              🚧
Wishlist / waiting list     🚧
Collaborative trips         🚧
AI itinerary optimization   🚧
Context-aware AI assistant  🚧
Nearby recommendations      🚧
Place-level cost estimates  🚧
Audio/cultural guides       🚧
Restaurant discovery        🚧
Real-time weather/traffic   🚧
Advanced budget optimizer   🚧
Offline travel guide        🚧

💡 Final Vision

GlobeTrotter is not intended to be just another website where someone manually writes:

Jaipur → Jodhpur → Udaipur

The long-term vision is to build a personal travel operating system.

A user should be able to say:

"I am going to Goa for five days with ₹30,000. I like beaches, local food, peaceful places and photography."

GlobeTrotter should help them:

Plan
  ↓
Discover
  ↓
Budget
  ↓
Optimize
  ↓
Collaborate
  ↓
Travel
  ↓
Explore nearby
  ↓
Learn about places
  ↓
Share experiences

And when another traveller searches for Goa, the first user's experience can help them plan their own journey.

That is the bigger idea behind GlobeTrotter.

❤️ Hackathon Note

This project was developed under a strict hackathon time limit. Therefore, the current submission intentionally focuses on delivering a stable and functional MVP rather than implementing every part of the larger product vision.

The future features in this README are not presented as completed functionality. They describe the product direction that could be developed with additional time, APIs, data, testing and production infrastructure.

The goal was not to claim that everything is finished. The goal was to build a solid foundation that can grow into the complete vision.

👨‍💻 Made By:
   
   Krishna Madhu

(may be the code is generated by the ai but ideas are all mine, may be i am not a coder, but i am a problem solver.)

Built with ❤️ for the hackathon.