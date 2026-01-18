#!/usr/bin/env node

/**
 * Image Optimization Script
 * Compresses large images to improve page load speed
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '../public');

async function optimizeImage(imagePath, outputPath, quality = 80) {
    try {
        const stats = fs.statSync(imagePath);
        const originalSize = (stats.size / 1024).toFixed(2);

        console.log(`\n📸 Optimizing: ${path.basename(imagePath)}`);
        console.log(`   Original size: ${originalSize} KB`);

        await sharp(imagePath)
            .webp({ quality })
            .toFile(outputPath);

        const newStats = fs.statSync(outputPath);
        const newSize = (newStats.size / 1024).toFixed(2);
        const savings = ((1 - newStats.size / stats.size) * 100).toFixed(1);

        console.log(`   ✅ Optimized size: ${newSize} KB`);
        console.log(`   💾 Saved: ${savings}% (${(originalSize - newSize).toFixed(2)} KB)`);

        return true;
    } catch (error) {
        console.error(`   ❌ Error optimizing ${imagePath}:`, error.message);
        return false;
    }
}

async function main() {
    console.log('🚀 Starting image optimization...\n');

    const imagesToOptimize = [
        {
            input: path.join(publicDir, 'og-image.png'),
            output: path.join(publicDir, 'og-image-optimized.webp'),
            quality: 80
        },
        {
            input: path.join(publicDir, 'PHP-logo.png'),
            output: path.join(publicDir, 'PHP-logo-optimized.webp'),
            quality: 80
        }
    ];

    let successCount = 0;

    for (const img of imagesToOptimize) {
        if (fs.existsSync(img.input)) {
            const success = await optimizeImage(img.input, img.output, img.quality);
            if (success) successCount++;
        } else {
            console.log(`⚠️  File not found: ${img.input}`);
        }
    }

    console.log(`\n✨ Optimization complete! ${successCount}/${imagesToOptimize.length} images optimized.`);
    console.log('\n📝 Next steps:');
    console.log('   1. Review the optimized images');
    console.log('   2. Replace original files with optimized versions if satisfied');
    console.log('   3. Update image references in your code if using .webp format\n');
}

main().catch(console.error);
