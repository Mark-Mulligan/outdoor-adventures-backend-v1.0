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
  if (q || designation || states) sqlString += ` WHERE`;
  if (q) sqlString += ` ${nameQuery(q)} ${designation || states ? 'AND' : ''}`;
  if (designation) sqlString += ` ${designationQuery(designation)} ${states ? 'AND' : ''}`;
  if (states) sqlString += ` ${statesQuery(states)}`;

  return sqlString;
};

const formatQueryData = (data, totalResults, limit, endIndex, page) => {
  const formattedData = {};
  formattedData.totalResults = totalResults;
  formattedData.totalPages = Math.ceil(totalResults / limit);
  formattedData.dataStart = endIndex - limit + 1;
  formattedData.dataEnd = totalResults > endIndex ? endIndex : totalResults;
  formattedData.currentPage = page;
  formattedData.results = data.map(({ fullname, parkcode, states, designation }) => {
    return { fullname, parkcode, states, designation };
  });

  return formattedData;
};

const orderByClause = (orderInput) => {
  const order = orderInput.split('-');
  if (
    (order[0] === 'parkname' || order[0] === 'states' || order[0] === 'designation') &&
    (order[1] === 'asc' || order[1] === 'desc')
  ) {
    return ` ORDER BY ${order[0]} ${order[1]}`;
  } else {
    return '';
  }
};

exports.getParks = async (req, res) => {
  const limit = parseInt(req.query.limit, 10);
  const page = parseInt(req.query.page, 10);
  const { designation, states, q, order } = req.query;

  let queryString = 'SELECT *, count(*) OVER() as totalResults from parks';

  queryString += constructSQLQuery(designation, states, q);
  queryString += order ? orderByClause(order) : '';

  const offset = (page - 1) * limit;
  const endIndex = page * limit;

  queryString += ` LIMIT ${limit} OFFSET ${offset};`;
  console.log(queryString);

  try {
    const [result] = await connection.promise().query(queryString);
    const totalResults = result.length > 0 ? result[0].totalResults : 0;
    const data = formatQueryData(result, totalResults, limit, endIndex, page);
    res.status(200).json(data);
  } catch (e) {
    console.log(e);
  }
};
