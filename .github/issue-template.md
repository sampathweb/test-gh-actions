---
name: Creating Issue on PR Rollback
title: Issue to resolve Rollback of PR: ${{ steps.pr-data.outputs.number }}
---

This PR ${{ steps.pr-data.outputs.number }} is rolled back in {{ github.head_commit.id }}.  Please follow-up with your reviewer and resolve the rollback.
