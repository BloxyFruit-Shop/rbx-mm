# Stock Update System

This system automatically fetches stock data from the Grow a Garden Values API and updates the stock in the Convex database every 5 minutes.

## How it works

1. **Automatic Scheduling**: The stock update system uses Convex's scheduling functionality to run every 5 minutes.
2. **External API Integration**: It fetches data from `https://growagardenvalues.com/stock/get_stock_data.php`
3. **Stock Management**: 
  - First, all existing stock quantities are set to 0
  - Then, new stock quantities from the API are applied
  - Stock history is maintained for tracking changes over time

## Files

- `stockUpdater.ts` - Main stock update logic with scheduling
- `stockAdmin.ts` - Admin functions to control the stock update system
- `init.ts` - Initialization script to start stock updates on deployment

## Usage

### Starting Stock Updates

There are two ways to start the stock update system:

1. **Automatic on deployment**: 
   ```bash
   npx convex run init
   ```
   This will automatically start the stock updates if they're not already running.

2. **Manual via admin mutation**:
   Use the `stockAdmin:startStockUpdates` mutation from the Convex dashboard or the admin UI.

### Stopping Stock Updates

Use the `stockAdmin:stopStockUpdates` mutation to stop all scheduled stock updates.

### Manual Update

To trigger a one-time stock update without affecting the schedule:
```
stockAdmin:triggerStockUpdate
```

### Monitoring

- Check if updates are running: `stockAdmin:isStockUpdateRunning`
- Get last update info: `stockAdmin:getLastStockUpdate`
- View logs in the Convex dashboard to see update history

## API Response Format

The system expects the following response format from the API:

```json
{
  "success": true,
  "gear": [
    {"name": "Trowel", "quantity": 2, "image": "trowel.png"},
    ...
  ],
  "seeds": [
    {"name": "Carrot", "quantity": 10, "image": "carrot.png"},
    ...
  ],
  "eggs": [
    {"name": "Common Egg", "quantity": 1, "image": "common-egg.png"},
    ...
  ],
  "lastUpdated": "10:43 PM",
  "timestamp": 1748644994,
  "usingFallback": false
}
```

## Important Notes

1. **Item Matching**: Items are matched by name. Ensure item names in the database match exactly with the API response.
2. **Missing Items**: If an item from the API doesn't exist in the database, it will be logged as a warning but won't stop the update process.
3. **Error Handling**: If the API fetch fails, the error is logged and the next scheduled update will still run.
4. **Stock History**: All stock changes are recorded in the `stockHistory` table for auditing purposes.

## Deployment

To ensure stock updates start automatically on deployment:

```bash
# Development
npx convex dev --run init

# Production
npx convex deploy && npx convex run init
```

## Troubleshooting

1. **Updates not running**: Check the Convex logs for any error messages
2. **Items not updating**: Verify item names match exactly between API and database
3. **API errors**: Check if the API endpoint is accessible and returning valid JSON