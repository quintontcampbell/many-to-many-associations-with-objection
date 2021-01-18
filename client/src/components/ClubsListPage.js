import React, { useState, useEffect } from "react"

import ClubTile from "./ClubTile.js"

const ClubsListPage = () => {
  const [clubs, setClubs] = useState([])

  const getClubs = async () => {
    try {
      const response = await fetch('/api/v1/clubs')
      if (!response.ok) {
        const errorMessage = `${response.status} (${response.statusText})`
        const error = new Error(errorMessage);
        throw(error);
      }
      const parsedResponse = await response.json()
      setClubs(parsedResponse.clubs);
    } catch(err) {
      console.error(`Error in fetch: ${err.message}`)
    }
  }

  useEffect(() => {
    getClubs()
  }, [])

  const clubTileComponents = clubs.map(clubObject => {
    return(
      <ClubTile
        key={clubObject.id}
        {...clubObject}
      />
    )
  })

  return(
    <div className="callout">
      Clubs Available to Join at Launch Academy University 
      {clubTileComponents}
    </div>
  )
}

export default ClubsListPage