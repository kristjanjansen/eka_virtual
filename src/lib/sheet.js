const parseSheet = (data) => {
  return data.feed.entry.map((entry) => {
    return Object.keys(entry)
      .map((field) => {
        if (field.startsWith("gsx$")) {
          return [field.split("$")[1], entry[field].$t];
        }
      })
      .filter((field) => field)
      .reduce((field, item) => {
        field[item[0]] = item[1];
        return field;
      }, {});
  });
};

export const getSheet = (id) => {
  return fetch(
    `https://spreadsheets.google.com/feeds/list/${id}/od6/public/values?alt=json`
  )
    .then((res) => res.json())
    .then((res) => parseSheet(res));
};
