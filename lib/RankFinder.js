// Copyright (c) 2020 aniket965
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/**
 * Resturns new array with Ranks
 * @param {array} Creditresults
 */
function RankFinder (Creditresults) {
  Creditresults.sort((a, b) => b.credit - a.credit)
  return Creditresults.map((result, i) => result.rollnumber)
}
module.exports = {
  RankFinder
}
