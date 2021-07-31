require('dotenv').config();
const axios = require('axios');

const connection = require('../config/connection');

const designationQuery = (designation) => {
  const parkDes = designation.split(',');
  let sqlString = '';
  parkDes.forEach((park, index) => {
    sqlString += index === parkDes.length - 1 ? `'${park}'` : `'${park}',`;
  });
  return ` designation IN (${sqlString})`;
};

const statesQuery = (states) => {
  const statesArr = states.split(',');
  let sqlString = '';
  statesArr.forEach((state, index) => {
    sqlString += index === 0 ? ` states LIKE '%${state}%'` : ` OR states LIKE '%${state}%'`;
  });
  return `(${sqlString})`;
};

const nameQuery = (name) => ` fullname LIKE '%${name}%'`;

const constructSQLQuery = (designation, states, q) => {
  let sqlString = '';
  if (designation && states && q) {
    sqlString += ` WHERE${nameQuery(q)} AND${statesQuery(states)} AND${designationQuery(designation)}`;
  } else if (q && designation) {
    sqlString += ` WHERE${nameQuery(q)} AND${designationQuery(designation)}`;
  } else if (q && states) {
    sqlString += ` WHERE${nameQuery(q)} AND${statesQuery(states)}`;
  } else if (designation && states) {
    sqlString += ` WHERE${statesQuery(states)} AND${designationQuery(designation)}`;
  } else {
    if (q) sqlString += ` WHERE${nameQuery(q)}`;
    if (designation) sqlString += ` WHERE${designationQuery(designation)}`;
    if (states) sqlString += ` WHERE${statesQuery(states)}`;
  }
  return sqlString;
};

const formatQueryData = (data, totalResults, limit, endIndex, page) => {
  const formattedData = {};
  formattedData.totalResults = totalResults;
  formattedData.totalPages = Math.ceil(totalResults / limit);
  formattedData.dataStart = endIndex - limit + 1;
  formattedData.dataEnd = totalResults > endIndex ? endIndex : totalResults;
  formattedData.currentPage = page;

  const results = [];
  data.forEach(({ fullname, parkcode, states, designation }) => {
    results.push({
      fullname,
      parkcode,
      states,
      designation,
    });
  });

  formattedData.results = results;
  return formattedData;
};

exports.getParks = async (req, res) => {
  const limit = parseInt(req.query.limit, 10);
  const page = parseInt(req.query.page, 10);
  const { designation, states, q } = req.query;

  let queryString = 'SELECT *, count(*) OVER() as totalResults from parks';

  queryString += constructSQLQuery(designation, states, q);

  const offset = (page - 1) * limit;
  const endIndex = page * limit;

  queryString += ` LIMIT ${limit} OFFSET ${offset};`;

  try {
    const [result] = await connection.promise().query(queryString);
    const totalResults = result.length > 0 ? result[0].totalResults : 0;
    const data = formatQueryData(result, totalResults, limit, endIndex, page);
    res.status(200).json(data);
  } catch (e) {
    console.log(e);
  }
};
