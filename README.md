Visualizing Indian Census 2011 data
===================================

This data was obtained from the website, [Census 2011](http://www.census2011.co.in). I tried to get the data from the Indian government website, but the data was all available in PDFs and after parsing the semi-structured data in the PDFs using regular expressions, I found this source which was easy to scrape.

I obtained the Shapefile for India from [DIVA-GIS](http://www.diva-gis.org/gdata) which I later converted to GeoJSON as it is easier to parse using Javascript. I then augmented the GeoJSON files with the census data and separating them into different file for different states to ensure quick response of the visualization. And I used [Leaflet.js](http://leafletjs.com/) for creating the choropleth map.
