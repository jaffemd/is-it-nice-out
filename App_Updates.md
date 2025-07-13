App Updates

Objective
We have a static app that shows if it was nice out today for static weather content. Our UI is good, we don't have to change that at the moment. However, let's update that to dynamically fetch weather data from a free, publicly available API. We're primarily interested in historical data for max temperature, min temperature, and precipitation amounts for a given location.

Tasks

Phase 1

1. Research publicly available weather api's and present me with the top 3 options and a brief description of pro's on cons. This application is for personal use only at the moment, so we don't have to worry about enterprise volume. 

2. Update api.ts to fetch weather data from that weather api on page load for a static location of Chicago, IL, zip code 60618. 

3. Based on the weather data for each day, we're going to algorithmically categorize each day as "good", "bad", or "okay" weather based on these rules:
In Fahrenheit degrees:
- If the max high temperature for a day was greater than 85 degrees or less than 45 degrees, that day automatically has "bad" weather. 
- Good weather must have a max high temperature between 55 and 82 degrees. 
- A day with max high weather between 45 and 49 degrees or 80 and 85 degrees can only be maximally rated "okay". 
- Very Light precipitation on a day with weather between 55 and 80 degrees can allow it to still be good.
- Very light precipitation on a day outside of those bounds above automatically knocks it down. to okay.
- Light precipitation on a day between 55 and 80 degrees knocks it down to a maximum rating of okay. 
- Very Heavy precipitation during daytime hours knocks the weather rating down to bad.
- Use your judgement to fill in any gaps in the above rules. 

4. Store that data in application memory or in local storage on the user's browser. Present me with 3 different options for how we can cache this data for our React application. We're mainly interested in storing it for the duration of the user's session, but if it has a TTL of up to 24 hours, that is fine, too. When thinking about this, keep in mind our future requirements for phase 2 and 3 and suggest options that won't have to change once we move onto future phases.

Phase 2

Now we're going to let the user input a location and dynamically fetch data for that location.

1. On page load, the app should be blank, except for a simple web form that asks the user to input a location.

2. Research location inputs that ideally could include a typeahead api for location names. We would prefer a free solution here. Present me with the top 3 options.

3. After the user inputs a location, there should be a submit button. This button will query our weather api from phase 1 and then display our calendar grid view with the fetched data.

4. There should be a "Start Over" button at the top of the page that clears the calendar and allows the user to input a new location.

Phase 3

This will be similar to Phase 2, but instead of clearing out locations and starting over, we'll allow the user to add a new "tab" with a new location. We'll have to add a header to collect all these tabs as well as making sure that our data structure can keep the weather data for all locations in memory at once. 

