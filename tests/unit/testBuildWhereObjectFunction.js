const expect = require('chai').expect;

const {buildWhereObject} = require('../../src/extensions/users-permissions/services/user');

describe('buildWhereObject function', function () {
  it('should convert filters object to valid where object', function () {
    const date = new Date();
    const res = buildWhereObject({enable: true, date: {lte: date}, post: {id: {eq: 1}}});
    expect(res).to.deep.equal({date: {$lte: date}, enable: true, post: {id: {$eq: 1}}});
  });

  it('should return empty object for null/undefined/empty-array value', function () {
    expect(buildWhereObject({})).to.deep.equal({});
    expect(buildWhereObject(0)).to.deep.equal(0);
    expect(buildWhereObject(1)).to.deep.equal(1);
    expect(buildWhereObject(null)).to.deep.equal(null);
    expect(buildWhereObject([])).to.deep.equal([]);
    expect(buildWhereObject(undefined)).to.deep.equal(undefined);
    expect(buildWhereObject()).to.deep.equal(undefined);
  });
});
