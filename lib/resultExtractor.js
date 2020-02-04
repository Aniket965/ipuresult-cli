// Copyright (c) 2020 aniket965
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT


const MAX_DEPTH_URLS = 1000;
const RankFinder = require("./RankFinder").RankFinder;


/**
 * Deprecated
 * returns new promise for Code
 * @param {string} link
 */
function extractCode(link) {
  const re = /(?!\d)_{0,1}\d{2,3}_/;
  var code = link.match(re)[0] + "";
  code = code.replace("_", "");
  code = code.replace("_", "");
  if (code.length < 3) {
    code = "0" + code;
  }
  try {
    code = extractSemCode(link) + code
  }catch(e) {
    console.log("either this result DON'T INC SEM CODES or it failed to MATCH")
  }
  const yearcode = link.substr(2, 2);
  code = code + yearcode;
  return code
}

function extractSemCode(link) {
  const semre = /s\d/g;
  const semcode = link
    .match(semre)[0]
    .toString()
    .substr(1, 1);
    return semcode
}

/**
 * Returns Student Data
 * @param {String} text
 */
function resultTxt2json(text) {
  const reme = /\d{11}[A-Z]{2}.{1,120}/gm;
  let dataChunk = text;
  var match = null;
  var processedData = {};
  var creditResults = [];
  while ((match = reme.exec(dataChunk))) {
    var studentResult = findStudentData(text, match.index);
    processedData[studentResult.rollnumber] = studentResult;
    creditResults.push({
      rollnumber: studentResult.rollnumber,
      credit: studentResult.credit
    });
  }
  processedData['code'] = courseCodeExtractor(text.substr(0,500))
  processedData['subject_codes'] = SubjectExtractor(text.substr(200,2500))
  processedData["rank_data"] = RankFinder(creditResults);
  return processedData;
}
function findStudentData(data, index) {
  var studentData = data.substring(index, index + 400);
  var rollnumber_ = studentData.substr(0, 11);
  return extractUsefulInfo(rollnumber_, studentData);
}

function extractUsefulInfo(rollnumber, studentInfo) {
  var sd = studentInfo + "";
  var name = studentInfo.substring(11, studentInfo.indexOf("SID:"));
  let reme = /\d{5}\(\d\)/g;
  var match;
  var prev = null;
  var result = [];
  var ids = {};
  var uniqIds = [];
  var totalScore = 0;
  var totalCredit = 0;
  var creditScore = 0;
  while ((match = reme.exec(studentInfo))) {
    if (prev === null || match.index - prev < 30) {
      var smalldata = sd.substr(match.index, 17);
      var id = smalldata.substring(0, 5);

      /**
       * checks if id do not already exists
       * if not exits it will add
       */

      if (ids[id] === undefined) {
        // var d = {}
        ids[id] = id;
        uniqIds.push(id);
        var credit = smalldata.substring(6, 7);
        credit = parseInt(credit);
        totalCredit += credit;
        /**
         * scoresting is small string for every subject id
         */

        var scorestring = smalldata.substring(8, smalldata.length);
        if (scorestring[0] === "-") {
          scorestring = scorestring.substring(0, scorestring.length - 2);
        }
        const rescore = /\d{1,2}/g;
        var scoreMatch = [];
        scoreMatch = scorestring.match(rescore);

        let internal = "NA";
        let external = "NA";
        let total = "NA";

        if (scoreMatch !== null && scoreMatch.length >= 2) {
          if (scoreMatch.indexOf(scoreMatch[0]) < 3) {
            internal = parseInt(scoreMatch[0]);
            external = parseInt(scoreMatch[1]);
            total = internal + external;
          }
        } else if (scoreMatch !== null && scoreMatch.length === 1) {
          if (scorestring.indexOf(scoreMatch[0]) < 3) {
            internal = scoreMatch[0];
            total = parseInt(internal);
          } else {
            external = scoreMatch[0];
            total = parseInt(external);
          }
        }
        if (total !== "NA") {
          totalScore = totalScore + total;
          creditScore = credit * total + creditScore;
        }
        result.push({
          id: id,
          credit: credit,
          internal_mark: internal,
          external_mark: external,
          total: total
        });
      } else {
        break;
      }
    }
    prev = match.index;
  }

  return {
    name: name,
    rollnumber: rollnumber,
    result: result,
    total: totalScore / uniqIds.length,
    credit: creditScore / totalCredit
  };
}
function isPdfLink(linkText, course) {
  let text = linkText.toLowerCase();
  return (
    text.includes("result") &&
    text.includes(course.toLowerCase()) &&
    !text.includes("enrol") &&
    !text.includes("e.n") &&
    !text.includes("revised") &&
    !text.includes("recheck") &&
    !text.includes("upto batch 2014") &&
    !text.includes("programme") &&
    !text.includes("equivalence") &&
    !text.includes("supplementary") &&
    !text.includes("change") &&
    !text.includes("mercy") &&
    !text.includes("case")
  );
}

/**
 *
 * @param {string} rawtext
 */
function courseCodeExtractor(rawtext) {
  let sIndex = rawtext.indexOf('Programme Code:')
  let tempString = rawtext.substr(sIndex+15,10)
  try {
      let code = tempString.match( /\d{3}/)[0]
      return code
  } catch (error) {
      console.error(error)
      return 0
  }
}

/**
 *
 * @param {string} rawText
 */
function SubjectExtractor(rawText) {
  let dict = {}
  try {
      let subjects = rawText.match(/\d{5,6}\r\n\w{5,8}\r\n/g)
      subjects.forEach(sub => {
          let indexofSub = rawText.indexOf(sub)
          let subString = rawText.substr(indexofSub,90)
          let str_code_index = subString.indexOf("\r\n")
          let str_code = subString.substr(0,str_code_index)
          let st_having_s_name = subString.substr(sub.length,60)
          let lastIndex = st_having_s_name.indexOf("\r\n")
          dict[str_code] = st_having_s_name.substr(0,lastIndex)
      })

      return dict
  } catch (error) {
      console.error(error)
  }
}

module.exports = {
  resultTxt2json,
  extractCode,
  isPdfLink,
  courseCodeExtractor,
  SubjectExtractor,
  extractSemCode
};
