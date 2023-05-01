const expect = require('chai').expect;

const {buildSortObject} = require("../../src/extensions/users-permissions/services/user");

describe('buildSortObject function', function () {
  it('should convert sort array to valid orderBy object', function () {
    const res = buildSortObject(['some:asc', 'eso:desc', 'ne:asc']);
    expect(res).to.deep.equal({
      eso: 'desc',
      ne: "asc",
      some: "asc"
    });
  });

  it('should return empty object for null/undefined/empty-array value', function () {
    expect(buildSortObject(null)).to.deep.equal({});
    expect(buildSortObject([])).to.deep.equal({});
    expect(buildSortObject(undefined)).to.deep.equal({});
    expect(buildSortObject()).to.deep.equal({});
  });
});
