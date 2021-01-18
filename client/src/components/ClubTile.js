import React from "react"
import { Link } from "react-router-dom"

const ClubTile = ({ id, name }) => {
  return(
    <div className="callout">
      <Link to={`/clubs/${id}`}> {name} </Link>
    </div>
  )
}

export default ClubTile