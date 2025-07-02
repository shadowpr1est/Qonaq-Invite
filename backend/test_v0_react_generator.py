#!/usr/bin/env python3
"""
🚀 V0.dev-Inspired React Generator Test Suite
===========================================

Testing the enhanced React component generator with modern patterns and better architecture.

Key Features Tested:
- V0.dev style prompting with thinking blocks
- Modern React patterns with TypeScript
- Glass morphism and advanced Tailwind techniques
- Component composition architecture
- Enhanced form validation and error handling
"""

import asyncio
import sys
import os
from pathlib import Path

# Add src directory to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from services.site_generator import SiteGenerator, GeneratedReactSite

class V0ReactGeneratorTester:
    """Test suite for the modernized React generator"""
    
    def __init__(self):
        self.generator = SiteGenerator()
        self.test_results = []
    
    async def test_wedding_site(self):
        """Test wedding site generation with v0.dev patterns"""
        print("\n🎨 Testing Wedding Site Generation...")
        
        site_data = GeneratedReactSite(
            title="Свадьба Алексея и Марии",
            meta_description="Приглашаем вас на нашу волшебную свадебную церемонию. Празднуем любовь, создаем воспоминания на всю жизнь.",
            component_name="WeddingInvitation",
            event_type="wedding",
            color_palette=["rose", "pink", "purple"],
            theme_config={
                "primary": "rose-600",
                "secondary": "pink-500", 
                "accent": "purple-400",
                "background": "gradient-to-br from-rose-50 to-pink-100"
            },
            animations=["fade-in", "scale-in", "bounce"],
            dependencies=["@types/react", "tailwindcss", "lucide-react"]
        )
        
        try:
            react_code = await self.generator.generate_react_page(site_data)
            
            # Validate generated code
            success = self._validate_react_code(react_code, site_data)
            
            if success:
                self._save_generated_code(react_code, "WeddingInvitation.tsx")
                print("✅ Wedding site generated successfully!")
                self.test_results.append(("Wedding Site", "PASSED"))
            else:
                print("❌ Wedding site generation failed validation")
                self.test_results.append(("Wedding Site", "FAILED"))
                
        except Exception as e:
            print(f"❌ Wedding site generation error: {e}")
            self.test_results.append(("Wedding Site", "ERROR"))
    
    async def test_corporate_site(self):
        """Test corporate event site with professional styling"""
        print("\n💼 Testing Corporate Event Site...")
        
        site_data = GeneratedReactSite(
            title="Конференция TechFlow 2024",
            meta_description="Ведущая технологическая конференция года. Инновации, нетворкинг, будущее технологий.",
            component_name="CorporateEvent",
            event_type="corporate",
            color_palette=["slate", "gray", "zinc"],
            theme_config={
                "primary": "slate-800",
                "secondary": "gray-600",
                "accent": "zinc-500",
                "background": "gradient-to-br from-slate-900 to-gray-900"
            },
            animations=["fade-up", "slide-in", "parallax"],
            dependencies=["@types/react", "tailwindcss", "framer-motion"]
        )
        
        try:
            react_code = await self.generator.generate_react_page(site_data)
            success = self._validate_react_code(react_code, site_data)
            
            if success:
                self._save_generated_code(react_code, "CorporateEvent.tsx")
                print("✅ Corporate site generated successfully!")
                self.test_results.append(("Corporate Site", "PASSED"))
            else:
                print("❌ Corporate site generation failed validation")
                self.test_results.append(("Corporate Site", "FAILED"))
                
        except Exception as e:
            print(f"❌ Corporate site generation error: {e}")
            self.test_results.append(("Corporate Site", "ERROR"))
    
    async def test_birthday_site(self):
        """Test birthday party site with energetic styling"""
        print("\n🎉 Testing Birthday Party Site...")
        
        site_data = GeneratedReactSite(
            title="День Рождения Анны - 25 лет!",
            meta_description="Празднуем четверть века жизни, смеха и приключений! Присоединяйтесь к незабываемой вечеринке.",
            component_name="BirthdayParty",
            event_type="birthday",
            color_palette=["blue", "indigo", "purple"],
            theme_config={
                "primary": "blue-600",
                "secondary": "indigo-500",
                "accent": "purple-400",
                "background": "gradient-to-br from-blue-900 to-purple-900"
            },
            animations=["bounce", "spin", "pulse"],
            dependencies=["@types/react", "tailwindcss", "react-confetti"]
        )
        
        try:
            react_code = await self.generator.generate_react_page(site_data)
            success = self._validate_react_code(react_code, site_data)
            
            if success:
                self._save_generated_code(react_code, "BirthdayParty.tsx")
                print("✅ Birthday site generated successfully!")
                self.test_results.append(("Birthday Site", "PASSED"))
            else:
                print("❌ Birthday site generation failed validation")
                self.test_results.append(("Birthday Site", "FAILED"))
                
        except Exception as e:
            print(f"❌ Birthday site generation error: {e}")
            self.test_results.append(("Birthday Site", "ERROR"))
    
    def _validate_react_code(self, code: str, site_data: GeneratedReactSite) -> bool:
        """Validate generated React code for v0.dev standards"""
        try:
            # Check TypeScript imports
            if "import React" not in code:
                print("❌ Missing React import")
                return False
            
            if "useState" not in code or "useCallback" not in code:
                print("❌ Missing essential React hooks")
                return False
            
            # Check TypeScript interfaces
            if "interface Props" not in code:
                print("❌ Missing Props interface")
                return False
            
            if "interface FormData" not in code:
                print("❌ Missing FormData interface")
                return False
            
            # Check component structure
            if f"const {site_data.component_name}" not in code:
                print("❌ Component name mismatch")
                return False
            
            if f"export default {site_data.component_name}" not in code:
                print("❌ Missing export statement")
                return False
            
            # Check modern patterns
            if "GlassButton" not in code:
                print("❌ Missing GlassButton component")
                return False
            
            if "Section" not in code:
                print("❌ Missing Section component")
                return False
            
            # Check Tailwind classes
            required_classes = [
                "backdrop-blur",
                "bg-gradient-to",
                "transition-all",
                "hover:scale",
                "rounded-"
            ]
            
            for class_name in required_classes:
                if class_name not in code:
                    print(f"❌ Missing Tailwind class: {class_name}")
                    return False
            
            # Check form validation
            if "submitStatus" not in code:
                print("❌ Missing form validation state")
                return False
            
            if "setSubmitStatus" not in code:
                print("❌ Missing form status setter")
                return False
            
            print("✅ All validation checks passed")
            return True
            
        except Exception as e:
            print(f"❌ Validation error: {e}")
            return False
    
    def _save_generated_code(self, code: str, filename: str):
        """Save generated code to output directory"""
        output_dir = Path("generated_components")
        output_dir.mkdir(exist_ok=True)
        
        output_file = output_dir / filename
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(code)
        
        print(f"💾 Saved to: {output_file}")
    
    def print_test_summary(self):
        """Print comprehensive test results"""
        print("\n" + "="*60)
        print("🧪 V0.DEV-INSPIRED REACT GENERATOR TEST RESULTS")
        print("="*60)
        
        passed = sum(1 for _, result in self.test_results if result == "PASSED")
        failed = sum(1 for _, result in self.test_results if result == "FAILED")
        errors = sum(1 for _, result in self.test_results if result == "ERROR")
        
        for test_name, result in self.test_results:
            status_icon = "✅" if result == "PASSED" else "❌" if result == "FAILED" else "⚠️"
            print(f"{status_icon} {test_name}: {result}")
        
        print("\n📊 SUMMARY:")
        print(f"   ✅ Passed: {passed}")
        print(f"   ❌ Failed: {failed}")
        print(f"   ⚠️  Errors: {errors}")
        print(f"   📈 Success Rate: {(passed / len(self.test_results) * 100):.1f}%")
        
        if passed == len(self.test_results):
            print("\n🎉 ALL TESTS PASSED! V0.dev-inspired architecture working perfectly!")
        else:
            print("\n🔧 Some tests need attention. Check the output above.")
    
    async def run_all_tests(self):
        """Run complete test suite"""
        print("🚀 Starting V0.dev-Inspired React Generator Test Suite...")
        print("Testing modern architecture patterns inspired by successful AI tools")
        
        # Run all test cases
        await self.test_wedding_site()
        await self.test_corporate_site()
        await self.test_birthday_site()
        
        # Print final results
        self.print_test_summary()

# Architecture demonstration
def demonstrate_architecture():
    """Demonstrate the new v0.dev-inspired architecture"""
    print("\n🏗️  V0.DEV-INSPIRED ARCHITECTURE FEATURES:")
    print("="*50)
    
    features = [
        "🎯 MDX-style thinking blocks in prompts",
        "⚛️  Component composition with Section/GlassButton",
        "🎨 Advanced Tailwind with glass morphism",
        "🔧 Enhanced TypeScript interfaces",
        "📝 Improved form validation with states",
        "🎭 Modern React hooks (useState, useCallback)",
        "🚀 Better error handling and fallbacks",
        "💎 V0.dev inspired prompting techniques",
        "🔍 Comprehensive code validation",
        "📦 Production-ready component output"
    ]
    
    for feature in features:
        print(f"   {feature}")
    
    print("\n🏆 INSPIRED BY:")
    print("   • V0.dev: MDX prompting, TypeScript-first")
    print("   • Bolt.new: Full-stack integration")  
    print("   • GrapesJS: Visual component modularity")
    print("   • Deco.cx: Modern React patterns")
    print("   • Loveable: Smart glue architecture")

if __name__ == "__main__":
    print("🎨 V0.DEV-INSPIRED REACT GENERATOR TEST")
    print("Мастер Уэйн, запускаю модернизированный генератор!")
    
    demonstrate_architecture()
    
    # Run the test suite
    tester = V0ReactGeneratorTester()
    asyncio.run(tester.run_all_tests()) 