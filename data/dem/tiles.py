import os
import whitebox
from osgeo import gdal
import numpy as np
import subprocess
# Initialize WhiteboxTools
wbt = whitebox.WhiteboxTools()

def delineate_basins(dem_path, output_dir, flow_accum_threshold, max_influence_distance):
    """
    Delineate basins from a DEM and save as vector
    
    Parameters:
    dem_path (str): Path to input DEM file
    output_dir (str): Directory to save output files
    """
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    # Define output paths
    filled_dem = os.path.join(output_dir, "filled_dem.tif")
    flow_accum = os.path.join(output_dir, "flow_accum.tif")
    flow_dir = os.path.join(output_dir, "flow_dir.tif")
    streams = os.path.join(output_dir, "streams.tif")

    influence = os.path.join(output_dir, "stream_influence.tif")

    watershed_raster = os.path.join(output_dir, "watershed.tif")
    watershed_vector = os.path.join(output_dir, "watershed.shp")

    basins_raster = os.path.join(output_dir, "basins.tif")
    basins_vector = os.path.join(output_dir, "basins.shp")
    strahlerbasins_raster = os.path.join(output_dir, "strahlerbasins.tif")
    strahlerbasins_vector = os.path.join(output_dir, "strahlerbasins.shp")
    subbasins_raster = os.path.join(output_dir, "subbasins.tif")
    subbasins_vector = os.path.join(output_dir, "subbasins.shp")
    
    # Fill depressions in DEM
    print("Filling depressions...")
    wbt.fill_depressions(
        dem_path,
        filled_dem
    )
    
    # Calculate flow direction
    print("Calculating flow direction...")
    wbt.d8_pointer(
        filled_dem,
        flow_dir
    )
    
    # Calculate flow accumulation
    print("Calculating flow accumulation...")
    wbt.d8_flow_accumulation(
        filled_dem,
        flow_accum
    )
    
    # Extract streams (modify threshold as needed)
    print("Extracting streams...")
    wbt.extract_streams(
        flow_accum,
        streams,
        threshold=flow_accum_threshold
    )
    
    # Calculate influence areas
    print("Calculating stream influence...")
    wbt.gaussian_filter(
        flow_accum,
        influence,
        sigma=max_influence_distance/4
    )

    # Get natural log of influence areas
    print("Calculating natural log of stream influence...")
    wbt.ln(
        influence, 
        influence
    )

    # Standard deviation contrast stretch
    print("Calculating standard deviation contrast stretch...")
    wbt.standard_deviation_contrast_stretch(
        influence, 
        influence, 
        stdev=2, 
        num_tones=3
    )

    print("Rescaling influence...")
    wbt.rescale_value_range(
        influence, 
        influence, 
        out_min_val=1, 
        out_max_val=4, 
    
    )

  

    # Reclassify influence into 4 classes
    # print("Reclassifying influence into 4 classes...")
    # wbt.reclass(
    #     influence,
    #     influence,
    #     reclass_vals='1;2;2;2;3;3;3;4;4',
    #     assign_mode=False
    # )

    ## Convert watershed to vector format
    #print("Converting to vector...")
    #wbt.raster_to_vector_polygons(
    #    watershed_raster,
    #    watershed_vector
    #)
    
    # Delineate basins
    print("Delineating basins")
    wbt.basins(
        flow_dir,
        basins_raster
    )
    
    # Convert basins to vector format
    print("Converting to vector...")
    wbt.raster_to_vector_polygons(
        basins_raster,
        basins_vector
    )
    
    # Delineate strahlerbasins
    print("Delineating strahlerbasins")
    wbt.strahler_order_basins(
        flow_dir,
        streams,
        strahlerbasins_raster
    )
    
    # Convert strahlerbasins to vector format
    print("Converting to vector...")
    wbt.raster_to_vector_polygons(
        strahlerbasins_raster,
        strahlerbasins_vector
    )
    
    # Delineate subbasins
    print("Delineating subbasins")
    wbt.subbasins(
        flow_dir,
        streams,
        subbasins_raster
    )
    
    # Convert subbasins to vector format
    print("Converting to vector...")
    wbt.raster_to_vector_polygons(
        subbasins_raster,
        subbasins_vector
    )

    
    
    print(f"Basin delineation complete! Results saved to: {basins_vector}")
    
    return basins_vector

def reclassify_influence_raster(input_file, output_file, num_classes=4):
    """
    Reclassify the influence raster using GDAL with a specified number of classes
    
    Parameters:
    input_file (str): Path to input raster file
    output_file (str): Path to output raster file
    num_classes (int): Number of desired classes (default=4)
    """
    # Open input dataset
    src_ds = gdal.Open(input_file)
    src_band = src_ds.GetRasterBand(1)
    src_data = src_band.ReadAsArray()
    
    # Create output raster
    driver = gdal.GetDriverByName('GTiff')
    dst_ds = driver.Create(output_file, 
                          src_ds.RasterXSize, 
                          src_ds.RasterYSize, 
                          1, 
                          gdal.GDT_Byte)
    
    # Copy projection and geotransform
    dst_ds.SetProjection(src_ds.GetProjection())
    dst_ds.SetGeoTransform(src_ds.GetGeoTransform())
    
    # Calculate breaks for N classes
    min_val = 1
    max_val = 4
    interval = (max_val - min_val) / num_classes
    
    # Perform reclassification
    dst_data = np.zeros_like(src_data, dtype=np.uint8)
    
    for i in range(num_classes):
        lower = min_val + (i * interval)
        upper = min_val + ((i + 1) * interval)
        
        if i == 0:
            # Include the lower bound for first class
            mask = (src_data >= lower) & (src_data <= upper)
        else:
            # Exclude lower bound for other classes
            mask = (src_data > lower) & (src_data <= upper)
            
        dst_data[mask] = i + 1  # Classes start from 1
    
    # Write output and set nodata value
    dst_band = dst_ds.GetRasterBand(1)
    dst_band.WriteArray(dst_data)
    dst_band.SetNoDataValue(0)
    
    # Clean up
    src_ds = None
    dst_ds = None
 
    return output_file

def convert_raster_to_vector(input_raster, output_vector):
    """
    Convert a raster file to vector format using WhiteboxTools
    
    Parameters:
    input_raster (str): Path to input raster file
    output_vector (str): Path to output vector file
    """
    wbt.set_nodata_value(
        input_raster, 
        input_raster, 
        back_value=1,
    )

    wbt.raster_to_vector_polygons(input_raster, output_vector)
    return output_vector

if __name__ == "__main__":
    pwd = os.getcwd()
    dem_path = os.path.join(pwd, "dem.tif")
    output_dir = os.path.join(pwd, "tiles")
    
    # Delineate basins
    delineate_basins(dem_path, output_dir, 1000, 1)
    
    # Reclassify influence
    print("Reclassifying influence...")
    input_file = os.path.join(output_dir, "stream_influence.tif")
    output_file = os.path.join(output_dir, "stream_influence_reclass.tif")
    reclassify_influence_raster(input_file, output_file, num_classes=4)
    
    # # Convert to vector
    vector_file = os.path.join(output_dir, "stream_influence_reclass.shp")
    convert_raster_to_vector(output_file, vector_file)

