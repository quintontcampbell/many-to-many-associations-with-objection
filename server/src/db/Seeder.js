/* eslint-disable no-console */
import { connection } from "../boot.js";
import configuration from "../config.js";

import Club from "../models/Club.js"
import Student from "../models/Student.js"
import Signup from "../models/Signup.js"

class Seeder {
  static async seed() {
    console.log("seeding...");
    const robotics = await Club.query().insert({name: "Robotics Club" })
    const improv = await Club.query().insert({name: "A Cappella Group" })

    await robotics.$relatedQuery('students').insert({ name: 'Bart Simpson' })
    await robotics.$relatedQuery('students').insert({ name: 'Steven Universe' })

    await improv.$relatedQuery('students').insert({ name: 'Kipo Oak' })
    await improv.$relatedQuery('students').insert({ name: 'Tina Belcher' })


    console.log("Done!");
    await connection.destroy();
  }
}

export default Seeder;