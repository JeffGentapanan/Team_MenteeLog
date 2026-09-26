import {test} from 'node:test';
import assert from 'node:assert/strict';
import {seedData} from '../dist/js/data.js';
import {ensureCreatorAccounts} from '../dist/js/creator.js';
import {visibleStudents,visibleApplications} from '../dist/js/domain.js';

test('creator migration preserves existing data and connects role-scoped accounts',()=>{
  const db=seedData(), originalUser=structuredClone(db.users[0]);
  ensureCreatorAccounts(db);
  assert.deepEqual(db.users[0],originalUser);
  const supervisor=db.users.find(u=>u.id==='creator-supervisor');
  assert.deepEqual(visibleStudents(db,supervisor).map(u=>u.id),['creator-student']);
  assert.equal(visibleApplications(db,supervisor).some(a=>a.id==='creator-application'),true);
  assert.equal(db.users.find(u=>u.id==='creator-coordinator').status,'Active');
  const count=db.users.length;
  supervisor.name='Updated creator';supervisor.status='Suspended';
  ensureCreatorAccounts(db);
  assert.equal(db.users.length,count);
  assert.equal(supervisor.name,'Updated creator');
  assert.equal(supervisor.status,'Suspended');
});
