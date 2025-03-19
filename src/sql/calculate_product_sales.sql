CREATE OR REPLACE PROCEDURE calculate_product_sales(p_product_id INTEGER)
LANGUAGE plpgsql
AS $$
DECLARE
  newer_record RECORD;
  older_record RECORD;
  sales_qty INTEGER;
BEGIN
  -- Get the latest two stock records for the product
  FOR newer_record IN 
    SELECT id, product_id, stock, checked_at 
    FROM products_history 
    WHERE product_id = p_product_id 
    ORDER BY checked_at DESC 
    LIMIT 2
  LOOP
    -- If this is the first record (latest record)
    IF older_record IS NULL THEN
      older_record := newer_record;
    ELSE
      -- Calculate sales between these two records
      -- Newer record has the most recent stock value
      -- Older record has the previous stock value
      
      -- If stock decreased (sales occurred): newer < older
      IF newer_record.stock < older_record.stock THEN
        sales_qty := older_record.stock - newer_record.stock;
        
        -- Only insert if we have a valid period (both timestamps exist)
        IF newer_record.checked_at IS NOT NULL AND older_record.checked_at IS NOT NULL THEN
          -- Insert the sales record
          INSERT INTO products_sales (
            product_id, 
            sales_quantity, 
            period_start, 
            period_end
          ) VALUES (
            p_product_id,
            sales_qty,
            older_record.checked_at,
            newer_record.checked_at
          );
        END IF;
      END IF;
      
      -- Exit after processing one pair
      EXIT;
    END IF;
  END LOOP;
END;
$$;