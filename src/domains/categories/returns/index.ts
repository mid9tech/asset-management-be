import { Category } from '../entities/category.entity';
import { ReportResponse } from '../entities/report.entity';

export const returningCategory = () => Category;

export const returningCategories = () => [Category];

export const returningReport = () => ReportResponse;
