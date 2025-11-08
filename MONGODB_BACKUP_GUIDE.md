# MongoDB Atlas Backup Configuration Guide

## Automatic Backups

MongoDB Atlas provides automatic backups for all clusters (including free tier).

### Backup Configuration

1. **Navigate to Atlas Dashboard:**
   - Go to your cluster → "Backup" tab

2. **Enable Continuous Backup (M10+ clusters):**
   - Free tier (M0): Snapshot backups only
   - Paid tiers (M10+): Continuous backups with point-in-time recovery

3. **Backup Schedule:**
   - **Free Tier:** Daily snapshots (retained for 2 days)
   - **M10+:** Continuous backups (retained for 35 days)

### Backup Retention

- **M0 (Free):** 2 days retention
- **M10:** 35 days retention
- **M30+:** 35 days retention (configurable)

### Restore Process

1. **From Atlas Dashboard:**
   - Go to Backup → Snapshots
   - Select snapshot → Restore
   - Choose restore point → Confirm

2. **Point-in-Time Recovery (M10+):**
   - Select time range
   - Choose target cluster
   - Restore

### Manual Backup (Export)

For additional safety, export data periodically:

```bash
# Using mongodump
mongodump --uri="mongodb+srv://username:password@cluster.mongodb.net/heka_db" \
  --out=/backup/heka-$(date +%Y%m%d)

# Using MongoDB Compass
# File → Export Collection → Select collections → Export
```

### Backup Verification

**Test Restore Monthly:**
1. Create test cluster
2. Restore from backup
3. Verify data integrity
4. Delete test cluster

### Recommended Setup

**For Production:**
- Use M10+ cluster for continuous backups
- Enable point-in-time recovery
- Test restore process monthly
- Keep manual exports for critical data

**For Development:**
- M0 free tier is sufficient
- Daily snapshots provide basic protection

### Backup Checklist

- [ ] Continuous backups enabled (M10+)
- [ ] Backup retention period configured
- [ ] Restore process tested
- [ ] Manual export schedule established
- [ ] Backup monitoring alerts configured

---

**Note:** MongoDB Atlas handles backups automatically. No additional configuration needed beyond selecting the right cluster tier.


