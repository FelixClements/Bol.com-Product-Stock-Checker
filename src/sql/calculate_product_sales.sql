-- Create calculate_sales stored procedure
CREATE OR REPLACE PROCEDURE calculate_product_sales(p_product_id INTEGER)
LANGUAGE plpgsql
AS $$
DECLARE
  current_record RECORD;
  previous_record RECORD;
  sales_qty INTEGER;
BEGIN
  -- Get the latest two stock records for the product
  -- Order by checked_at DESC to get the most recent records first
  FOR current_record IN 
    SELECT id, product_id, stock, checked_at 
    FROM products_history 
    WHERE product_id = p_product_id 
    ORDER BY checked_at DESC 
    LIMIT 2
  LOOP
    -- If this is the first record (latest record)
    IF previous_record IS NULL THEN
      previous_record := current_record;
    ELSE
      -- Calculate sales (stock decrease) between these two records
      -- previous_record has the newer stock value, current_record has the older value
      
      -- If stock increased (restock occurred), set sales to 0
      IF previous_record.stock >= current_record.stock THEN
        sales_qty := 0;
      ELSE
        -- Calculate positive sales (stock decreased)
        sales_qty := current_record.stock - previous_record.stock;
      END IF;
      
      -- Only insert if we have a valid period (both timestamps exist)
      IF previous_record.checked_at IS NOT NULL AND current_record.checked_at IS NOT NULL THEN
        -- Insert the sales record
        INSERT INTO products_sales (
          product_id, 
          sales_quantity, 
          period_start, 
          period_end
        ) VALUES (
          p_product_id,
          sales_qty,
          current_record.checked_at,
          previous_record.checked_at
        );
      END IF;
      
      -- Exit after processing one pair
      EXIT;
    END IF;
  END LOOP;
  
  -- Commit the transaction
  COMMIT;
END;
$$;