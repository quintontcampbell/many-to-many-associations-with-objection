import React, { useState, useEffect } from "react"

import StudentTile from "./StudentTile.js"

const ClubShowPage = (props) => {
  const [club, setClub] = useState({ students: [] })

  const id = props.match.params.id

  const getClub = async () => {
    try {
      const response = await fetch(`/api/v1/clubs/${id}`)
      if (!response.ok) {
        const errorMessage = `${response.status} (${response.statusText})`
        const error = new Error(errorMessage);
        throw(error);
      }
      const clubData = await response.json()
      setClub(clubData.club);
    } catch(error) {
      console.error(`Error in fetch: ${error.message}`)
    }
  }
  
  useEffect(() => {
    getClub()
  }, [])


  const studentTileComponents = club.students.map(studentObject => {
    return(
      <StudentTile
        key={studentObject.id}
        {...studentObject}
      />
    )
  })

  return(
    <div className="callout">
      <h1>{club.name}</h1>
      {studentTileComponents}
    </div>
  )
}

export default ClubShowPage
