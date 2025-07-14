function apiResponse({
  code = 200,
  message = 'Success',
  status = true,
  data = null,
}) {
  return { code, message, status, data };
}

function paginatedResponse({
  data_per_page,
  page,
  max_page,
  message = 'Success',
}) {
  return {
    code: 200,
    message,
    status: true,
    data: {
      data_per_page,
      meta: {
        page,
        max_page,
      },
    },
  };
}

module.exports = {
  apiResponse,
  paginatedResponse,
};
